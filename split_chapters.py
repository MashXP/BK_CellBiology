
import json
import os
import subprocess

def create_subchapter_pdfs():
    with open('/home/mashxp/Documents/CellBiology/bookmarks.json') as f:
        data = json.load(f)

    outlines = data['outlines']
    
    # Skip front matter and back matter
    chapters = outlines[2:-3]

    for i, chapter in enumerate(chapters):
        chapter_title = chapter['title'].strip().replace(' ', '_').replace('/', '_')
        chapter_num_str = chapter_title.split('-')[0]
        
        # clean up the chapter title
        chapter_name = "_".join(chapter_title.split('-')[1:]).strip()
        
        chapter_dir = f"/home/mashxp/Documents/CellBiology/chapters/{chapter_num_str}-{chapter_name}"
        os.makedirs(chapter_dir, exist_ok=True)

        subchapters = chapter['kids']
        for j, subchapter in enumerate(subchapters):
            subchapter_title = subchapter['title'].strip().replace(' ', '_').replace('/', '_')
            if j == 0:
                start_page = chapter['destpageposfrom1']
            else:
                start_page = subchapter['destpageposfrom1']
            
            end_page = 0
            # determine end page
            if j + 1 < len(subchapters):
                end_page = subchapters[j+1]['destpageposfrom1'] - 1
            else:
                if i + 1 < len(chapters):
                    end_page = outlines[-3]['destpageposfrom1'] -1

            # Make sure end_page is not smaller than start_page
            if end_page < start_page:
                if i + 1 < len(chapters):
                    end_page = chapters[i+1]['destpageposfrom1'] - 1
                else:
                    end_page = outlines[-3]['destpageposfrom1'] -1


            temp_dir = f"/home/mashxp/.gemini/tmp/4bad2cc3103548046dff843b6ae55a17004fff3e302d102f6a718275fb8ca43b/temp_pages"
            os.makedirs(temp_dir, exist_ok=True)

            # Use %d for pdfseparate
            separate_command = f"pdfseparate -f {start_page} -l {end_page} /home/mashxp/Documents/CellBiology/essential-cell-biology-5th-edition.pdf {temp_dir}/page-%d.pdf"
            
            try:
                subprocess.run(separate_command, shell=True, check=True, capture_output=True, text=True)
            except subprocess.CalledProcessError as e:
                print(f"Error separating {subchapter_title}: {e.stderr}")
                continue

            # Use a glob pattern for pdfunite that will work even with one file
            unite_command = f"pdfunite {temp_dir}/page-*.pdf {chapter_dir}/{j+1:02d}_{subchapter_title}.pdf"
            try:
                subprocess.run(unite_command, shell=True, check=True, capture_output=True, text=True)
            except subprocess.CalledProcessError as e:
                print(f"Error uniting {subchapter_title}: {e.stderr}")
                continue

            # Clean up temp files
            subprocess.run(f"rm -rf {temp_dir}", shell=True, check=True)

if __name__ == '__main__':
    create_subchapter_pdfs()
