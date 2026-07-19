import os
import re

# Lista de arquivos para atualizar
files = [f"product{i}.html" for i in range(6, 24)]  # product6.html até product23.html

# Substituições
replacements = [
    ('<i class="h-icon h-headset"></i>', '''<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 1C8.13 1 5 4.13 5 8C5 10.38 6.19 12.47 8 13.74V17C8 17.55 8.45 18 9 18H15C15.55 18 16 17.55 16 17V13.74C17.81 12.47 19 10.38 19 8C19 4.13 15.87 1 12 1ZM14 19H10V21H14V19Z" fill="currentColor"/>
                                </svg>'''),
    ('<i class="h-icon h-whitehouse"></i>', '''<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M10 20V14H14V20H19V12H22L12 3L2 12H5V20H10Z" fill="currentColor"/>
                                </svg>'''),
    ('<i class="h-icon h-debt"></i>', '''<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M11.8 10.9C9.53 10.31 8.8 9.7 8.8 8.75C8.8 7.66 9.81 6.9 11.5 6.9C13.28 6.9 13.94 7.75 14 9H16.21C16.14 7.28 15.09 5.7 13 5.19V3H10V5.16C8.06 5.58 6.5 6.84 6.5 8.77C6.5 11.08 8.41 12.23 11.2 12.9C13.7 13.5 14.2 14.38 14.2 15.31C14.2 16 13.71 17.1 11.5 17.1C9.28 17.1 8.63 16.18 8.5 15H6.32C6.44 17.19 8.08 18.42 10 18.83V21H13V18.85C14.95 18.5 16.5 17.35 16.5 15.3C16.5 12.46 14.07 11.5 11.8 10.9Z" fill="currentColor"/>
                                </svg>'''),
    ('<i class="h-icon h-blog"></i>', '''<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19ZM17 12H7V10H17V12ZM15 16H7V14H15V16ZM17 8H7V6H17V8Z" fill="currentColor"/>
                                </svg>'''),
    ('<i class="h-icon h-accessibility"></i>', '''<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V21C3 22.11 3.89 23 5 23H11V21H5V3H13V9H21ZM14 10V12H22V10H14ZM14 14V16H22V14H14ZM14 18V20H19V18H14Z" fill="currentColor"/>
                                </svg>'''),
]

for filename in files:
    filepath = filename
    if os.path.exists(filepath):
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            original_content = content
            for old, new in replacements:
                content = content.replace(old, new)
            
            if content != original_content:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f"✅ Atualizado: {filename}")
            else:
                print(f"⏭️  Sem alterações: {filename}")
        except Exception as e:
            print(f"❌ Erro ao processar {filename}: {e}")
    else:
        print(f"⚠️  Arquivo não encontrado: {filename}")

print("\n✅ Processo concluído!")

