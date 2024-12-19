from django.core.management.base import BaseCommand
from django.core.files import File
import requests
from bs4 import BeautifulSoup
import time
import tempfile
import os
from products.models import Category, SubCategory, Product, ProductImage
import shutil
from django.core.files.temp import NamedTemporaryFile

class Command(BaseCommand):
    help = 'Vatan Bilgisayardan ürün verilerini ve resimlerini çeker'

    def download_and_save_image(self, product, image_url, headers):
        try:
            self.stdout.write(f"Downloading image from: {image_url}")
            response = requests.get(image_url, headers=headers, stream=True)
            
            if response.status_code == 200:
                # Mevcut primary resimleri false yap
                ProductImage.objects.filter(
                    product=product, 
                    is_primary=True
                ).update(is_primary=False)
                
                # Yeni resmi kaydet
                product_image = ProductImage(
                    product=product,
                    is_primary=True
                )
                
                # Geçici dosya oluştur ve içeriği kaydet
                with tempfile.NamedTemporaryFile() as temp_image:
                    # Resmi geçici dosyaya kaydet
                    for chunk in response.iter_content(chunk_size=8192):
                        if chunk:
                            temp_image.write(chunk)
                    
                    # Dosya işaretçisini başa al
                    temp_image.seek(0)
                    
                    # Resmi kaydet
                    product_image.image.save(
                        f"{product.slug}-main.jpg",
                        File(temp_image),
                        save=True
                    )
                
                return True
                
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Resim indirme hatası: {product.name} - {str(e)}')
            )
            return False

    def handle(self, *args, **kwargs):
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }

        # Kategorileri oluştur
        elektronik, _ = Category.objects.get_or_create(name="Elektronik")
        aksesuar, _ = Category.objects.get_or_create(name="Aksesuar")

        category_urls = {
            # Elektronik kategorisi
            ('Elektronik', 'Laptop'): 'https://www.vatanbilgisayar.com/notebook/',
            ('Elektronik', 'Telefon'): 'https://www.vatanbilgisayar.com/galaxy-a-serisine-sahip-olmanin-tam-zamani/?utm_source=157066samsung&utm_medium=157066samsung&utm_campaign=157066samsung&utm_content=157066samsung&utm_term=157066samsung',
            ('Elektronik', 'Tablet'): 'https://www.vatanbilgisayar.com/tabletler/',
            ('Elektronik', 'Kulaklık'): 'https://www.vatanbilgisayar.com/bluetooth-kulaklik-mikrofon/',
            ('Elektronik', 'Kamera'): 'https://www.vatanbilgisayar.com/fotograf-makinesi/',
            ('Elektronik', 'Akıllı Saat'): 'https://www.vatanbilgisayar.com/arama/148691-148693/?utm_source=157027&utm_medium=157027&utm_campaign=157027&utm_content=157027&utm_term=157027',
            
            # Aksesuar kategorisi
            ('Aksesuar', 'Telefon Kılıfı'): 'https://www.teknosa.com/telefon-kilifi-c-100002011',
            ('Aksesuar', 'Powerbank'): 'https://www.vatanbilgisayar.com/tasinabilir-batarya/',
            ('Aksesuar', 'Şarj Aleti'): 'https://www.vatanbilgisayar.com/telefon-sarj-aletleri/',
            ('Aksesuar', 'Ekran Koruyucu'): 'https://www.vatanbilgisayar.com/ekran-koruyucu/',
            ('Aksesuar', 'Kablo'): 'https://www.vatanbilgisayar.com/kablolar/',
        }

        for (category_name, subcategory_name), url in category_urls.items():
            self.stdout.write(f"Fetching {category_name} - {subcategory_name} products...")
            
            # Ana kategori için
            main_category = elektronik if category_name == "Elektronik" else aksesuar
            
            # Alt kategori için
            subcategory, _ = SubCategory.objects.get_or_create(
                category=main_category,
                name=subcategory_name
            )

            try:
                response = requests.get(url, headers=headers)
                soup = BeautifulSoup(response.content, 'html.parser')
                
                product_cards = soup.find_all('div', class_='product-list__content')
                
                for card in product_cards[:10]:  # Her kategoriden 10 ürün olacak
                    try:
                        name = card.find('div', class_='product-list__product-name').text.strip()
                        
                        price_text = card.find('span', class_='product-list__price').text.strip()
                        price = float(price_text.replace('TL', '').replace('.', '').replace(',', '.').strip())
                        
                        # Ana sayfadaki ürün resmini al
                        image_url = None
                        product_image = card.find('img')
                        if product_image:
                            # Farklı resim attributelerini kontrol edecek:
                            for attr in ['src', 'data-src', 'data-original']:
                                if product_image.get(attr):
                                    image_url = product_image[attr]
                                    break
                        
                        product_link = 'https://www.vatanbilgisayar.com' + card.find('a')['href']
                        
                        # Ürün detay sayfasını çekmek için 1 saniye bekleyecek
                        time.sleep(1)
                        product_response = requests.get(product_link, headers=headers)
                        product_soup = BeautifulSoup(product_response.content, 'html.parser')
                        
                        # Eğer ana sayfadan resim alınamadıysa detay sayfasından deneyecek
                        if not image_url:
                            detail_image = product_soup.find('img', class_='img-responsive')
                            if detail_image:
                                for attr in ['src', 'data-src', 'data-original']:
                                    if detail_image.get(attr):
                                        image_url = detail_image[attr]
                                        break
                        
                        # URL'yi düzeltmek için
                        if image_url and not image_url.startswith('http'):
                            image_url = 'https:' + image_url if image_url.startswith('//') else 'https://' + image_url
                        
                        # Özellikler tablosunu bul
                        specs = {}
                        specs_table = product_soup.find('div', class_='product-table')
                        if specs_table:
                            rows = specs_table.find_all('tr')
                            for row in rows:
                                cols = row.find_all('td')
                                if len(cols) >= 2:
                                    key = cols[0].text.strip()
                                    value = cols[1].text.strip()
                                    specs[key] = value

                        # Ürünü oluştur veya güncelle
                        product, created = Product.objects.get_or_create(
                            name=name,
                            defaults={
                                'category': main_category,  
                                'subcategory': subcategory,
                                'description': f"Detaylı bilgi için: {product_link}",
                                'price': price,
                                'specs': specs,
                                'stock': 50,
                                'status': 'active'
                            }
                        )

                        # Resmi indirmek ve kaydetmek için
                        if image_url:
                            success = self.download_and_save_image(product, image_url, headers)
                            if success:
                                self.stdout.write(
                                    self.style.SUCCESS(f'Resim başarıyla eklendi: {name}')
                                )
                        else:
                            self.stdout.write(
                                self.style.WARNING(f'No image found for: {name}')
                            )

                        self.stdout.write(self.style.SUCCESS(f'Added/Updated: {name}'))
                        
                    except Exception as e:
                        self.stdout.write(
                            self.style.ERROR(f"Error processing product: {str(e)}")
                        )
                        continue
                    
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f"Error fetching {category_name} - {subcategory_name}: {str(e)}")
                )
                continue

        self.stdout.write(self.style.SUCCESS('All products fetched successfully!'))