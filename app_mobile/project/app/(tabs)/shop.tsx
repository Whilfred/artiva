import { useState } from 'react';
import { View, Text, ScrollView, Image, StyleSheet, Pressable, useWindowDimensions, TextInput, Modal } from 'react-native';
import { Filter, ChevronDown, Search, X } from 'lucide-react-native';
import { useCartStore } from '../../store/cart'; // Importer le store Zustand
import { router } from 'expo-router';

const categories = [
  'Tous',
  'Électronique',
  'Mode',
  'Maison',
  'Sport'
];

const products = [
  {
    id: 1,
    name: 'MacBook Pro 16"',
    price: '2499 FCFA',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500',
    category: 'Électronique',
    description: 'Le MacBook Pro 16 pouces est doté de la puce M1 Pro ou M1 Max d\'Apple pour des performances exceptionnelles.',
    specs: ['Écran Liquid Retina XDR', 'Jusqu\'à 64 Go de mémoire unifiée', 'Jusqu\'à 8 To de stockage']
  },
  {
    id: 2,
    name: 'MacBook Pro 16"',
    price: '2499 FCFA',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500',
    category: 'Électronique',
    description: 'Le MacBook Pro 16 pouces est doté de la puce M1 Pro ou M1 Max d\'Apple pour des performances exceptionnelles.',
    specs: ['Écran Liquid Retina XDR', 'Jusqu\'à 64 Go de mémoire unifiée', 'Jusqu\'à 8 To de stockage']
  },
  {
    id: 3,
    name: 'MacBook Pro 16"',
    price: '2499 FCFA',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500',
    category: 'Électronique',
    description: 'Le MacBook Pro 16 pouces est doté de la puce M1 Pro ou M1 Max d\'Apple pour des performances exceptionnelles.',
    specs: ['Écran Liquid Retina XDR', 'Jusqu\'à 64 Go de mémoire unifiée', 'Jusqu\'à 8 To de stockage']
  },
  {
    id: 4,
    name: 'MacBook Pro 16"',
    price: '2499 FCFA',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500',
    category: 'Électronique',
    description: 'Le MacBook Pro 16 pouces est doté de la puce M1 Pro ou M1 Max d\'Apple pour des performances exceptionnelles.',
    specs: ['Écran Liquid Retina XDR', 'Jusqu\'à 64 Go de mémoire unifiée', 'Jusqu\'à 8 To de stockage']
  },
  {
    id: 5,
    name: 'MacBook Pro 16"',
    price: '2499 FCFA',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500',
    category: 'Électronique',
    description: 'Le MacBook Pro 16 pouces est doté de la puce M1 Pro ou M1 Max d\'Apple pour des performances exceptionnelles.',
    specs: ['Écran Liquid Retina XDR', 'Jusqu\'à 64 Go de mémoire unifiée', 'Jusqu\'à 8 To de stockage']
  },
  {
    id: 6,
    name: 'MacBook Pro 16"',
    price: '2499 FCFA',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500',
    category: 'Électronique',
    description: 'Le MacBook Pro 16 pouces est doté de la puce M1 Pro ou M1 Max d\'Apple pour des performances exceptionnelles.',
    specs: ['Écran Liquid Retina XDR', 'Jusqu\'à 64 Go de mémoire unifiée', 'Jusqu\'à 8 To de stockage']
  },
  {
    id: 7,
    name: 'MacBook Pro 16"',
    price: '2499 FCFA',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500',
    category: 'Électronique',
    description: 'Le MacBook Pro 16 pouces est doté de la puce M1 Pro ou M1 Max d\'Apple pour des performances exceptionnelles.',
    specs: ['Écran Liquid Retina XDR', 'Jusqu\'à 64 Go de mémoire unifiée', 'Jusqu\'à 8 To de stockage']
  },
  {
    id: 8,
    name: 'MacBook Pro 16"',
    price: '2499 FCFA',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500',
    category: 'Électronique',
    description: 'Le MacBook Pro 16 pouces est doté de la puce M1 Pro ou M1 Max d\'Apple pour des performances exceptionnelles.',
    specs: ['Écran Liquid Retina XDR', 'Jusqu\'à 64 Go de mémoire unifiée', 'Jusqu\'à 8 To de stockage']
  },
  // (Autres produits similaires ici...)
];

export default function ShopScreen() {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCategories, setShowCategories] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<null | typeof products[0]>(null);
  const addItem = useCartStore((state) => state.addItem); // Récupération de la fonction addItem

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'Tous' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAddToCart = (product) => {
    // Ajouter le produit sélectionné au panier
    addItem({ 
      id: product.id.toString(), // Convertit l'id en string
      name: product.name,
      price: parseFloat(product.price.replace('FCFA', '').trim()), // Convertit le prix en nombre
      image: product.image 
    });
    //alert(`${product.name} a été ajouté au panier !`);
    //router.push('/cart'); // Redirection vers le panier après ajout
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Boutique</Text>
        
        <View style={styles.searchContainer}>
          <Search size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Rechercher un produit..."
          />
        </View>

        <View style={styles.filterContainer}>
          <Pressable 
            style={styles.filterButton}
            onPress={() => setShowCategories(true)}
          >
            <Text style={styles.filterButtonText}>
              {selectedCategory}
            </Text>
            <ChevronDown size={20} color="#1F2937" />
          </Pressable>
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={[
          styles.productsGrid,
          isTablet && styles.tabletGrid
        ]}
      >
        {filteredProducts.map((product) => (
          <Pressable 
            key={product.id} 
            style={[styles.productCard, isTablet && styles.tabletCard]}
            onPress={() => setSelectedProduct(product)}
          >
            <Image source={{ uri: product.image }} style={styles.productImage} />
            <View style={styles.productInfo}>
              <Text style={styles.categoryLabel}>{product.category}</Text>
              <Text style={styles.productName}>{product.name}</Text>
              <Text style={styles.productPrice}>{product.price}</Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>

      {/* Modal des catégories */}
      <Modal
        visible={showCategories}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Catégories</Text>
              <Pressable onPress={() => setShowCategories(false)}>
                <X size={24} color="#1F2937" />
              </Pressable>
            </View>
            {categories.map((category) => (
              <Pressable
                key={category}
                style={[
                  styles.categoryItem,
                  selectedCategory === category && styles.categoryItemSelected
                ]}
                onPress={() => {
                  setSelectedCategory(category);
                  setShowCategories(false);
                }}
              >
                <Text style={[
                  styles.categoryItemText,
                  selectedCategory === category && styles.categoryItemTextSelected
                ]}>
                  {category}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </Modal>

      {/* Modal des détails du produit */}
      <Modal
        visible={!!selectedProduct}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Détails du produit</Text>
              <Pressable onPress={() => setSelectedProduct(null)}>
                <X size={24} color="#1F2937" />
              </Pressable>
            </View>
            {selectedProduct && (
              <ScrollView>
                <Image 
                  source={{ uri: selectedProduct.image }} 
                  style={styles.modalProductImage}
                />
                <View style={styles.modalProductInfo}>
                  <Text style={styles.modalProductCategory}>
                    {selectedProduct.category}
                  </Text>
                  <Text style={styles.modalProductName}>
                    {selectedProduct.name}
                  </Text>
                  <Text style={styles.modalProductPrice}>
                    {selectedProduct.price}
                  </Text>
                  <Text style={styles.modalProductDescription}>
                    {selectedProduct.description}
                  </Text>
                  <Text style={styles.specsTitle}>Caractéristiques :</Text>
                  {selectedProduct.specs.map((spec, index) => (
                    <Text key={index} style={styles.specItem}>
                      • {spec}
                    </Text>
                  ))}
                  <Pressable  
                    style={styles.addToCartButton}
                    onPress={() => handleAddToCart(selectedProduct)}
                  >
                    <Text style={styles.addToCartButtonText}>
                      Ajouter au panier
                    </Text>
                  </Pressable>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    padding: 16, // Réduit le padding pour ajuster l'espacement
    paddingTop: 50, // Réduit le padding du haut pour remonter la section
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    position: 'relative', // Assure que la barre reste dans le flux normal
    zIndex: 10,
  },
  title: {
    fontFamily: 'Poppins-Bold',
    fontSize: 24, // Réduit la taille du titre
    color: '#1F2937',
    marginBottom: 12, // Réduit la marge inférieure
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    padding: 10, // Réduit le padding pour un meilleur ajustement
    borderRadius: 8,
    marginBottom: 12, // Ajuste l'espace sous la barre de recherche
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#1F2937',
  },
  filterContainer: {
    marginTop: 8,
    alignItems: 'flex-end',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
  },
  filterButtonText: {
    marginRight: 8,
    fontSize: 16,
    color: '#1F2937',
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    padding: 16,
  },
  tabletGrid: {
    justifyContent: 'flex-start',
    paddingLeft: 32,
    paddingRight: 32,
  },
  productCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 16,
    width: 150,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  tabletCard: {
    width: 250,
    marginHorizontal: 16,
  },
  productImage: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  productInfo: {
    padding: 8,
  },
  categoryLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    textTransform: 'uppercase',
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginVertical: 4,
  },
  productPrice: {
    fontSize: 14,
    color: '#1F2937',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 8,
    width: '80%',
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  modalProductImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 16,
  },
  modalProductInfo: {
    paddingVertical: 8,
  },
  modalProductCategory: {
    fontSize: 14,
    color: '#9CA3AF',
    textTransform: 'uppercase',
  },
  modalProductName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  modalProductPrice: {
    fontSize: 16,
    color: '#1F2937',
    marginVertical: 8,
  },
  modalProductDescription: {
    fontSize: 14,
    color: '#1F2937',
    marginBottom: 16,
  },
  specsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  specItem: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  addToCartButton: {
    marginTop: 16,
    backgroundColor: '#1F2937',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  addToCartButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  categoryItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  categoryItemSelected: {
    backgroundColor: '#F3F4F6',
  },
  categoryItemText: {
    fontSize: 16,
    color: '#1F2937',
  },
  categoryItemTextSelected: {
    fontWeight: 'bold',
  },
});
