from langchain_aws import ChatBedrock, BedrockEmbeddings
from langchain_postgres import PGVector
from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from app.core.config import settings
import json
import re
import boto3

class RAGService:
    def __init__(self, session_id: str = None):
        self.session_id = session_id
        
        # Initialize Bedrock client
        self.bedrock_client = boto3.client(
            "bedrock-runtime",
            region_name=settings.AWS_REGION,
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY
        )
        
        # Use Bedrock Embeddings (Titan)
        self.embeddings = BedrockEmbeddings(
            client=self.bedrock_client,
            model_id=settings.BEDROCK_EMBEDDING_MODEL
        )
        
        # Use Bedrock LLM (Nova Pro)
        self.llm = ChatBedrock(
            client=self.bedrock_client,
            model_id=settings.BEDROCK_TEXT_MODEL,
            model_kwargs={"temperature": 0.3}
        )
        
        # Use IBM Granite (via Bedrock) for Quiz Generation
        self.granite_llm = ChatBedrock(
            client=self.bedrock_client,
            model_id=settings.IBM_GRANITE_MODEL,
            model_kwargs={"temperature": 0.3}
        )
        
        self.connection_string = settings.DATABASE_URL
        self.collection_name = "study_materials"
        
        self.vector_store = PGVector(
            embeddings=self.embeddings,
            collection_name=self.collection_name,
            connection=self.connection_string,
            use_jsonb=True,
        )
        # self.ensure_index() # Call this to optimize speed


    def ensure_index(self):
        """Creates HNSW index for faster retrieval."""
        try:
            from sqlalchemy import create_engine, text
            engine = create_engine(self.connection_string)
            with engine.connect() as conn:
                # Check if index exists, if not create it
                # Using HNSW for speed (approximate) vs IVFFlat (exact)
                conn.execute(text("CREATE INDEX IF NOT EXISTS embedding_hnsw ON langchain_pg_embedding USING hnsw (embedding vector_cosine_ops)"))
                conn.commit()
        except Exception as e:
            print(f"Index optimization skipped: {e}")


    def add_document(self, text: str, metadata: dict = None):
        """Splits text and adds to vector store with session_id."""
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200
        )
        texts = text_splitter.split_text(text)
        
        base_metadata = metadata or {}
        if self.session_id:
            base_metadata["session_id"] = self.session_id
        
        metadatas = [base_metadata.copy() for _ in texts]
        
        self.vector_store.add_texts(texts, metadatas=metadatas)
        return len(texts)

    def delete_session_documents(self, session_id: str) -> int:
        try:
            from sqlalchemy import create_engine, text
            engine = create_engine(self.connection_string)
            with engine.connect() as conn:
                result = conn.execute(
                    text("DELETE FROM langchain_pg_embedding WHERE cmetadata->>'session_id' = :sid"),
                    {"sid": session_id}
                )
                conn.commit()
                return result.rowcount
        except Exception as e:
            print(f"Error deleting session documents: {e}")
            return 0

    def get_session_documents_list(self) -> list:
        try:
            from sqlalchemy import create_engine, text
            engine = create_engine(self.connection_string)
            with engine.connect() as conn:
                result = conn.execute(
                    text("SELECT DISTINCT cmetadata->>'source' as source FROM langchain_pg_embedding WHERE cmetadata->>'session_id' = :sid"),
                    {"sid": self.session_id}
                )
                sources = [row[0] for row in result if row[0]]
                return sources
        except Exception as e:
            print(f"Error getting document list: {e}")
            return []

    def _format_docs_with_sources(self, docs) -> tuple[str, list]:
        """Format docs and extract source info including page numbers."""
        formatted = []
        sources = []
        
        for doc in docs:
            content = doc.page_content
            metadata = doc.metadata or {}
            source = metadata.get('source', 'Unknown')
            
            # Extract page number from content if present
            page_match = re.search(r'\[Page (\d+) of (\d+)\]', content)
            if page_match:
                page_num = page_match.group(1)
                total_pages = page_match.group(2)
                sources.append(f"{source} (Page {page_num}/{total_pages})")
            else:
                sources.append(source)
            
            formatted.append(content)
        
        return "\n\n".join(formatted), list(set(sources))

    def _get_session_retriever(self, k: int = 15, source_filter: str = None): # Increased k for better recall
        filter_dict = {}
        if self.session_id:
            filter_dict["session_id"] = self.session_id
        if source_filter and source_filter != "all":
            filter_dict["source"] = source_filter
            
        if filter_dict:
            return self.vector_store.as_retriever(
                search_kwargs={"filter": filter_dict, "k": k}
            )
        return self.vector_store.as_retriever(search_kwargs={"k": k})

    def chat(self, query: str) -> dict:
        """Answers a question using RAG. Returns response with sources."""
        retriever = self._get_session_retriever()
        docs = retriever.invoke(query)
        
        if not docs:
            return {
                "response": "I don't have any information about this topic in your uploaded documents. Please upload relevant study materials first.",
                "sources": []
            }
        
        context, sources = self._format_docs_with_sources(docs)
        
        # More balanced prompt - strict on facts but flexible on phrasing
        system_prompt = """You are a helpful study assistant. Answer the question based on the provided context.

Context from uploaded documents:
{context}

Instructions:
1. Answer the question using ONLY the information from the context above.
2. If the context contains the answer (conceptually or explicitly), explain it clearly.
3. If the context mentions related concepts but not the exact answer, explain what IS mentioned.
4. If the context definitely does not contain the answer, state that you don't have that information.
5. Do not hallucinate or fix gaps with outside knowledge.
"""

        messages = [
            {"role": "system", "content": system_prompt.format(context=context)},
            {"role": "user", "content": query}
        ]
        
        response = self.llm.invoke(messages)
        
        return {
            "response": response.content,
            "sources": sources
        }

    def generate_summary(self, text_context: str = None, summary_type: str = "detailed", source_filter: str = None):
        if not text_context or text_context == "full_context_trigger":
            return self.generate_summary_from_store(summary_type, source_filter)
            
        prompt_style = "Provide a concise, 1-paragraph overview." if summary_type == "brief" else "Provide a comprehensive, detailed study note with bullet points and key definitions."
        
        prompt = f"{prompt_style}\n\nContext:\n{text_context[:15000]}"
        messages = [{"role": "user", "content": prompt}]
        response = self.llm.invoke(messages)
        return response.content
        
    def generate_summary_from_store(self, summary_type: str = "detailed", source_filter: str = None):
        query = "Summarize the main concepts briefly." if summary_type == "brief" else "Provide detailed study notes covering all key topics in the material."
        
        if source_filter and source_filter != "all":
            query = f"Summarize the content from {source_filter}: {query}"
        
        # Use filtered retriever
        retriever = self._get_session_retriever(k=20, source_filter=source_filter)
        docs = retriever.invoke(query)
        
        if not docs:
            return "I couldn't find information for that specific context. Please check if the document was uploaded correctly."

        context, sources = self._format_docs_with_sources(docs)
        
        prompt = f"""You are an expert study assistant.
        
Context from selected documents ({source_filter if source_filter else 'All'}):
{context}

Request: {query}

Instructions:
1. Focus ONLY on the provided context.
2. { 'Keep it concise (1-2 paragraphs).' if summary_type == 'brief' else 'Use bullet points, bold key terms, and clearly structure sections.' }
3. If the context is limited, summarize what is available.
"""
        messages = [{"role": "user", "content": prompt}]
        response = self.llm.invoke(messages)
        return response.content

    def get_context_for_quiz(self, topic: str) -> tuple[str, int]:
        retriever = self._get_session_retriever(k=20)
        
        search_query = f"Key concepts and important information about {topic}" if topic != "general" else "Main concepts, key facts, and important information"
        docs = retriever.invoke(search_query)
        
        if not docs:
            return "", 0
        
        context, _ = self._format_docs_with_sources(docs)
        word_count = len(context.split())
        max_questions = max(5, min(50, word_count // 40))
        
        return context, max_questions

    def generate_quiz(self, topic: str = "general", difficulty: str = "medium", num_questions: int = 5):
        context, max_possible = self.get_context_for_quiz(topic)
        
        if not context.strip():
            return {
                "questions": [],
                "count": 0,
                "difficulty": difficulty,
                "warning": "No documents found in your session. Please upload study materials first."
            }
        
        actual_questions = min(num_questions, max_possible)
        warning = None
        
        if num_questions > max_possible:
            warning = f"Not enough content to generate {num_questions} questions. Generated {actual_questions} questions based on available content."
        
        difficulty_instructions = {
            "easy": "Create simple, straightforward questions testing basic recall and understanding.",
            "medium": "Create moderately challenging questions that test comprehension and application.",
            "hard": "Create challenging questions that test analysis, synthesis, and critical thinking."
        }
        
        prompt = f"""Create a quiz based ONLY on the provided context. Do NOT use any external knowledge.

Context from study materials:
{context[:10000]}

Instructions:
- Generate exactly {actual_questions} multiple-choice questions
- Topic: {topic if topic != "general" else "general content from materials"}
- Difficulty: {difficulty} - {difficulty_instructions.get(difficulty, difficulty_instructions['medium'])}
- Questions MUST be based ONLY on information in the context - no external knowledge
- Return as JSON list with keys: 'question', 'options' (4 strings), 'answer' (correct option), 'topic' (brief topic)
- No markdown, just raw JSON
"""
        
        messages = [{"role": "user", "content": prompt}]
        # Using Nova Pro (IBM Granite not enabled in Bedrock account)
        response = self.llm.invoke(messages)
        content = response.content.replace("```json", "").replace("```", "").strip()
        
        try:
            quiz_data = json.loads(content)
            result = {
                "questions": quiz_data,
                "count": len(quiz_data),
                "difficulty": difficulty,
                "requested": num_questions
            }
            if warning:
                result["warning"] = warning
            return result
        except json.JSONDecodeError:
            return {"questions": [], "count": 0, "error": "Failed to parse quiz. Please try again."}

    def analyze_weak_spots(self, questions: list, user_answers: dict) -> dict:
        wrong_topics = []
        correct_topics = []
        
        for i, q in enumerate(questions):
            topic = q.get('topic', 'General')
            if user_answers.get(str(i)) != q.get('answer'):
                wrong_topics.append({
                    "question": q.get('question'),
                    "topic": topic,
                    "correct_answer": q.get('answer'),
                    "your_answer": user_answers.get(str(i), "Not answered")
                })
            else:
                correct_topics.append(topic)
        
        if not wrong_topics:
            return {
                "score": len(questions),
                "total": len(questions),
                "weak_spots": [],
                "recommendation": "Excellent! You've mastered all the topics covered in this quiz."
            }
        
        weak_topic_list = list(set([w['topic'] for w in wrong_topics]))
        
        recommendation_prompt = f"""Based on these topics the student got wrong: {weak_topic_list}
        
Provide a brief, encouraging study recommendation (2-3 sentences) focusing on these weak areas."""
        
        try:
            response = self.llm.invoke([{"role": "user", "content": recommendation_prompt}])
            recommendation = response.content
        except:
            recommendation = f"Focus on reviewing: {', '.join(weak_topic_list)}"
        
        return {
            "score": len(questions) - len(wrong_topics),
            "total": len(questions),
            "weak_spots": wrong_topics,
            "topics_to_review": weak_topic_list,
            "recommendation": recommendation
        }

    def analyze_pyq_pattern(self, pyq_text: str) -> dict:
        """Analyzes the structure and style of a Previous Year Question paper."""
        prompt = f"""Analyze this exam paper and extract its structure.
        
PYQ Content:
{pyq_text[:10000]}

Return a JSON object with this EXACT structure:
{{
    "sections": [
        {{
            "name": "Section Name (e.g. Section A - MCQs)",
            "type": "mcq/short/long",
            "count": "Number of questions (integer)",
            "marks_per_question": "Marks (integer)",
            "description": "Brief description of question style"
        }}
    ],
    "total_marks": "Total marks (integer)",
    "difficulty": "Easy/Medium/Hard"
}}
Do not output markdown."""
        
        try:
            response = self.llm.invoke([{"role": "user", "content": prompt}])
            content = response.content.replace("```json", "").replace("```", "").strip()
            return json.loads(content)
        except Exception as e:
            print(f"Error analyzing PYQ: {e}")
            return None

    def generate_sample_paper(self, session_context: str, pyq_pattern: dict) -> dict:
        """Generates a new sample paper based on session content and PYQ pattern."""
        if not session_context:
            return {"error": "No study materials found in session."}

        paper_structure = []
        
        for section in pyq_pattern.get('sections', []):
            count = int(section.get('count', 5))
            
            prompt = f"""Create exam questions based on the provided study material, strictly following the section format.

Study Material Context:
{session_context[:15000]}

Section Requirements:
- Name: {section['name']}
- Type: {section['type']}
- Count: {count}
- Marks: {section['marks_per_question']}
- Style: {section['description']}

Instructions:
1. Generate exactly {count} questions.
2. Questions must be based on the Study Material.
3. OUTPUT FORMAT: A valid JSON LIST of objects: [{{ "question": "...", "answer": "Model answer..." }}]
4. No markdown.
"""
            try:
                response = self.llm.invoke([{"role": "user", "content": prompt}])
                content = response.content.replace("```json", "").replace("```", "").strip()
                questions = json.loads(content)
                
                paper_structure.append({
                    "section": section['name'],
                    "marks": section['marks_per_question'],
                    "questions": questions
                })
            except Exception as e:
                print(f"Error generating section {section['name']}: {e}")
                continue

        return {"paper": paper_structure, "original_pattern": pyq_pattern}

    async def generate_slide_content(self, topic: str, num_slides: int = 5) -> list[dict]:
        """
        Generates structured content for slides including title, bullets, and speaker notes.
        """
        # Get context (use broader search for presentation)
        context, _ = self.get_context_for_quiz(topic)
        
        prompt = f"""Create content for a {num_slides}-slide PowerPoint presentation about "{topic}".
        
        Context from study materials:
        {context[:15000]}
        
        Instructions:
        1. Generate exactly {num_slides} slides (plus a title slide implied, do not count the title slide in the list)
        2. For each slide provide:
           - "title": Short, catchy title
           - "points": List of 3-5 clear bullet points
           - "notes": Detailed speaker notes explaining the slide (approx 50-80 words)
        3. Content must be based on the provided context
        4. Output strictly as a JSON list of objects
        
        Example format:
        [
            {{
                "title": "Introduction to Photosynthesis",
                "points": ["Definition of process", "Importance for life", "Key components involved"],
                "notes": "Here we introduce the concept..."
            }}
        ]
        
        Make it professional and educational.
        """
        
        messages = [{"role": "user", "content": prompt}]
        
        # Use Nova Pro for high quality content
        response = self.llm.invoke(messages)
        content = response.content.replace("```json", "").replace("```", "").strip()
        
        try:
            slides_data = json.loads(content)
            return slides_data
        except:
            # Fallback if JSON fails
            return []

    def teacher_chat(self, query: str, language: str = "English") -> dict:
        """Detailed teacher-style explanation with examples in requested language."""
        retriever = self._get_session_retriever(k=10)
        docs = retriever.invoke(query)
        
        if not docs:
            return {
                "response": "I couldn't find specific information about this in your documents. However, I can explain the general concept if you like, or try asking about a different topic included in your study materials.",
                "sources": []
            }
        
        context, sources = self._format_docs_with_sources(docs)
        
        system_prompt = """You are an expert Teacher AI. Your goal is not just to answer, but to TEACH.

Context from study materials:
{context}

Target Language: {language}

Instructions:
1. Explain the concept in a clear, engaging, and detailed manner in {language}.
2. Use ANALOGIES and REAL-WORLD EXAMPLES to make the concept understandable.
3. If the answer involves steps, break them down clearly.
4. Use a friendly, encouraging tone (like a supportive tutor).
5. Stick to the facts in the context, but you CAN introduce standard pedagogical examples to illustrate those facts.
6. If the concept is complex, start simple and build up.

Structure your response to be spoken naturally.
"""

        messages = [
            {"role": "system", "content": system_prompt.format(context=context, language=language)},
            {"role": "user", "content": query}
        ]
        
        # Slightly higher temp for better analogies
        self.llm.temperature = 0.5 
        response = self.llm.invoke(messages)
        self.llm.temperature = 0.3 # Reset
        
        return {
            "response": response.content,
            "sources": sources
        }
