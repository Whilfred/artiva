import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  Pressable,
  TextInput,
  useWindowDimensions,
  Modal,
  StyleSheet,
} from 'react-native';
import { Search, X } from 'lucide-react-native'; // Icônes pour la recherche et la fermeture
import { useCartStore } from '../../store/cart'; // Utilisation de Zustand pour gérer le panier

// Catégories
const categories = [
  { id: 1, name: 'Électronique', image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=500' },
  { id: 2, name: 'Mode', image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=500' },
  { id: 3, name: 'Maison', image: 'https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=500' },
  { id: 4, name: 'Sport', image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500' },
];

// Produits
const featuredProducts = [
  { id: 1, name: 'iPhone 15 Pro', price: '999 FCFA', categoryId: 1, image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=500' },
  { id: 2, name: 'MacBook Air M2', price: '1299 FCFA', categoryId: 1, image: 'https://via.placeholder.com/300' },
  { id: 3, name: 'Robe élégante', price: '49 FCFA', categoryId: 2, image: 'https://via.placeholder.com/300' },
  { id: 4, name: 'Chaussures de sport', price: '89 FCFA', categoryId: 4, image: 'https://via.placeholder.com/300' },
  { id: 5, name: 'Canapé confortable', price: '499 FCFA', categoryId: 3, image: 'https://via.placeholder.com/300' },
];

export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const addItem = useCartStore((state) => state.addItem); // Ajout d'article au panier via Zustand

  // Filtrage des produits
  const filteredProducts = selectedCategory
    ? featuredProducts.filter((product) => product.categoryId === selectedCategory.id)
    : featuredProducts.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );

  // Gère l'ouverture de la modal
  const openModal = (product) => {
    setSelectedProduct(product);
    setModalVisible(true);
  };

  // Gère la fermeture de la modal
  const closeModal = () => {
    setSelectedProduct(null);
    setModalVisible(false);
  };

  // Ajoute un produit au panier
  const addToCart = (product) => {
    addItem({
      id: product.id,
      name: product.name,
      price: parseInt(product.price.replace(' FCFA', ''), 10),
      image: product.image,
    });
    setModalVisible(false);
    alert(`${product.name} a été ajouté au panier !`);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Bonjour 👋🇧🇯</Text>
        <Text style={styles.title}>Découvrez nos produits</Text>
      </View>

      {/* Barre de recherche */}
      <View style={styles.searchContainer}>
        <Search size={20} color="#9CA3AF" />
        <TextInput
          style={styles.searchPlaceholder}
          placeholder="Rechercher un produit..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Affichage des catégories */}
      <Text style={styles.sectionTitle}>
        {/* {selectedCategory ? selectedCategory.name : 'Catégories'} */}
        Catégories
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
      >
       
        {categories.map((category) => (
          
          <Pressable
          
            key={category.id}
            style={styles.categoryCard}
            onPress={() => {
              setSelectedCategory(category);
              setSearchQuery('');
            }}
          >
            <Image
              source={{ uri: category.image }}
              style={styles.categoryImage}
              resizeMode="cover" // Ajouté pour bien gérer l'affichage des images
            />
            
            <Text style={styles.categoryName}>{category.name}</Text>
          </Pressable>
        ))}
      </ScrollView>
      <Text style={styles.sectionTitle}>
        Pour vous
      </Text>
      {/* Produits */}
      <View style={[styles.productsGrid, isTablet && styles.tabletGrid]}>
        {filteredProducts.map((product) => (
          <Pressable
            key={product.id}
            style={[styles.productCard, isTablet && styles.tabletCard]}
            onPress={() => openModal(product)}
          >
            <Image
              source={{ uri: product.image }}
              style={styles.productImage}
              resizeMode="cover" // Ajouté pour bien gérer l'affichage des images
            />
            <View style={styles.productInfo}>
              <Text style={styles.productName}>{product.name}</Text>
              <Text style={styles.productPrice}>{product.price}</Text>
            </View>
          </Pressable>
        ))}
      </View>

      {/* Modal des détails */}
      <Modal animationType="slide" transparent={false} visible={modalVisible}>
        <View style={styles.modalContainer}>
          {selectedProduct && (
            <>
              <Image
                source={{ uri: selectedProduct.image }}
                style={styles.modalImage}
                resizeMode="cover" // Pour que l'image s'affiche correctement dans le modal
              />
              <Text style={styles.modalTitle}>{selectedProduct.name}</Text>
              <Text style={styles.modalPrice}>{selectedProduct.price}</Text>
              <Pressable style={styles.addToCartButton} onPress={() => addToCart(selectedProduct)}>
                <Text style={styles.addToCartButtonText}>Ajouter au panier</Text>
              </Pressable>
              <Pressable style={styles.closeButton} onPress={closeModal}>
                <X size={24} color="#532FB6FF" />
              </Pressable>
            </>
          )}
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    padding: 24,
    paddingTop: 60,
  },
  greeting: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: '#6B7280',
  },
  title: {
    fontFamily: 'Poppins-Bold',
    fontSize: 24,
    color: '#1F2937',
    marginTop: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 24,
    padding: 12,
    borderRadius: 12,
    marginBottom: 24,
  },
  searchPlaceholder: {
    marginLeft: 8,
    color: '#9CA3AF',
    fontFamily: 'Poppins-Regular',
    flex: 1,
  },
  sectionTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: '#1F2937',
    marginHorizontal: 24,
    marginBottom: 16,
  },
  categoriesContainer: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  categoryCard: {
    marginRight: 16,
    width: 120,
  },
  categoryImage: {
    width: 120,
    height: 120,
    borderRadius: 12,
  },
  categoryName: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: '#1F2937',
    marginTop: 8,
    textAlign: 'center',
  },
  productsGrid: {
    padding: 24,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  tabletGrid: {
    gap: 24,
  },
  productCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
  },
  tabletCard: {
    minWidth: '30%',
  },
  productImage: {
    width: '100%',
    height: 180,
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: '#1F2937',
  },
  productPrice: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: '#1ABC9C',
    marginTop: 4,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 24,
  },
  modalImage: {
    width: '100%',
    height: 300,
    borderRadius: 12,
  },
  modalTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 24,
    color: '#1F2937',
    marginVertical: 16,
    textAlign: 'center',
  },
  modalPrice: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 20,
    color: '#FF4B55',
    marginVertical: 8,
    textAlign: 'center',
  },
  addToCartButton: {
    marginTop: 16,
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  addToCartButtonText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  closeButton: {
    marginTop: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF4B55',
    padding: 10,
    borderRadius: 8,
  },
});
