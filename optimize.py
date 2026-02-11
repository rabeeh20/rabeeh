
from PIL import Image
import os
import sys

def optimize_image(input_path, output_path, max_width=400):
    try:
        if not os.path.exists(input_path):
            print(f"Error: {input_path} not found")
            return

        original_size = os.path.getsize(input_path)
        print(f"Original size: {original_size / 1024:.2f} KB")

        with Image.open(input_path) as img:
            # Resize
            if img.width > max_width:
                ratio = max_width / img.width
                new_height = int(img.height * ratio)
                img = img.resize((max_width, new_height), Image.Resampling.LANCZOS)
                print(f"Resized to {max_width}x{new_height}")

            # Save optimized
            img.save(output_path, "JPEG", quality=80, optimize=True)
        
        new_size = os.path.getsize(output_path)
        print(f"New size: {new_size / 1024:.2f} KB")
        print(f"Reduction: {(1 - new_size/original_size)*100:.1f}%")

    except Exception as e:
        print(f"Optimization failed: {e}")

if __name__ == "__main__":
    optimize_image(
        r"c:\Users\pcrab\OneDrive\Desktop\rabeeh\avatar.jpg",
        r"c:\Users\pcrab\OneDrive\Desktop\rabeeh\avatar_opt.jpg"
    )
