import docx
from docx.shared import Pt, Inches, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH

def append_appendix():
    doc = docx.Document('AI_Study_Buddy_Project_Report_Mohd_Atif_Salmani_v2.docx')
    
    img_landing = r'C:\Users\pmiay\.gemini\antigravity-ide\brain\cae28e33-649f-4c39-ad6c-9461bc02068b\ui_landing_page_1785131973786.png'
    img_dashboard = r'C:\Users\pmiay\.gemini\antigravity-ide\brain\cae28e33-649f-4c39-ad6c-9461bc02068b\ui_learning_dashboard_1785131988572.png'
    img_voice = r'C:\Users\pmiay\.gemini\antigravity-ide\brain\cae28e33-649f-4c39-ad6c-9461bc02068b\ui_voice_teacher_1785132016055.png'
    img_quiz = r'C:\Users\pmiay\.gemini\antigravity-ide\brain\cae28e33-649f-4c39-ad6c-9461bc02068b\ui_quiz_analytics_1785132035751.png'

    def add_heading(text, level=1, space_before=18, space_after=6):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(space_before)
        p.paragraph_format.space_after = Pt(space_after)
        p.paragraph_format.keep_with_next = True
        
        run = p.add_run(text)
        run.font.name = 'Calibri'
        run.bold = True
        if level == 1:
            run.font.size = Pt(16)
            run.font.color.rgb = RGBColor(0, 32, 96) # Dark Blue
        elif level == 2:
            run.font.size = Pt(13)
            run.font.color.rgb = RGBColor(31, 78, 121) # Soft Blue
        return p

    def add_p(text="", bold_prefix="", space_after=6):
        p = doc.add_paragraph()
        p.paragraph_format.space_after = Pt(space_after)
        p.paragraph_format.line_spacing = 1.15
        
        if bold_prefix:
            r0 = p.add_run(bold_prefix)
            r0.bold = True
            r0.font.name = 'Calibri'
            r0.font.size = Pt(11)
            
        if text:
            r1 = p.add_run(text)
            r1.font.name = 'Calibri'
            r1.font.size = Pt(11)
            
        return p

    def add_fig(img_path, caption_text):
        p_img = doc.add_paragraph()
        p_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_img.paragraph_format.space_before = Pt(8)
        p_img.paragraph_format.space_after = Pt(4)
        run = p_img.add_run()
        run.add_picture(img_path, width=Inches(5.5))
        
        p_cap = doc.add_paragraph()
        p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_cap.paragraph_format.space_after = Pt(14)
        r_cap = p_cap.add_run(caption_text)
        r_cap.font.name = 'Calibri'
        r_cap.font.size = Pt(10)
        r_cap.bold = True
        r_cap.font.italic = True
        r_cap.font.color.rgb = RGBColor(80, 80, 80)

    # APPENDIX B
    add_heading("Appendix B: Application UI Features & Screenshots", level=1, space_before=24)
    add_p("This appendix presents the user interface (UI) design, visual layout, and operational screenshots of the AI Study Buddy platform as deployed on AWS EC2. Built using React 18, Tailwind CSS, Lucide icons, and modern glassmorphism design principles, the user interface delivers an intuitive, responsive student dashboard.")

    # B.1
    add_heading("B.1 Hero Landing Page & Document Ingestion Interface", level=2)
    add_p("The landing page serves as the entry point for student study sessions. It features a modern dark-mode glassmorphic hero banner, session title input fields, and an interactive drag-and-drop PDF document uploader. Upon dropping course material (textbooks, lecture slides, or syllabus PDFs), real-time progress bars indicate PyPDF parsing, character chunking, and pgvector embedding insertion.")
    add_fig(img_landing, "Figure B.1: AI Study Buddy Hero Landing Page & Document Upload Interface")

    # B.2
    add_heading("B.2 Interactive Learning Dashboard & Multi-Modal Navigation", level=2)
    add_p("The primary learning dashboard provides a unified workspace for student interaction. It features a left sidebar for session history and document management, a central conversational RAG chat pane with cited text chunk references, and top navigation tabs for switching seamlessly between Q&A Chat, Practice Quizzes, Audio Teacher, and Slide Presentation Exporters.")
    add_fig(img_dashboard, "Figure B.2: Interactive Learning Dashboard & Multi-Modal Navigation")

    # B.3
    add_heading("B.3 Multi-Lingual Audio Teacher Voice Interface", level=2)
    add_p("The Audio Teacher module converts written textbook explanations into human-like spoken audio lessons using Edge-TTS neural voice synthesis. Students can select their preferred spoken language (English, Hindi, Spanish), adjust speech speed playback, play/pause audio streams, and read along with real-time highlighted text transcripts.")
    add_fig(img_voice, "Figure B.3: Interactive AI Teacher Voice & Text Interface")

    # B.4
    add_heading("B.4 Dynamic Quiz Generator & Weakness Analytics Dashboard", level=2)
    add_p("The Quiz and Diagnostic module automatically synthesizes multiple-choice questions grounded in uploaded study material. After students complete a quiz, the system evaluates their submissions, displays an overall score metric, generates a topic-wise weakness diagnostic chart, and highlights specific textbook chapters needing revision.")
    add_fig(img_quiz, "Figure B.4: Dynamic Quiz Generator & Weak-Spot Analytics Dashboard")

    doc.save('AI_Study_Buddy_Project_Report_Mohd_Atif_Salmani_v2.docx')
    print("Successfully appended Appendix B UI Features & Screenshots to Word report!")

if __name__ == '__main__':
    append_appendix()
