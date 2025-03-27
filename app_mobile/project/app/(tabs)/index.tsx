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

// Import des images locales
import iphoneImage from '../../assets/images/Martistore_calavi/air_pod/image1.png';
import macbookImage from '../../assets/images/Jordan_noir/image1.jpeg';
// import robeImage from '../../assets/images/robe.png';
// import chaussuresImage from '../../assets/images/chaussures.png';
// import canapeImage from '../../assets/images/canape.png';

// Catégories
const categories = [
  { id: 1, name: 'Électronique', image: require('../../assets/images/Adidas_blanc/image.jpeg') },
  { id: 2, name: 'Mode', image: require('../../assets/images/Air_noir/image1.jpeg') },
  // { id: 3, name: 'Maison', image: require('../../assets/images/maison.png') },
  // { id: 4, name: 'Sport', image: require('../../assets/images/sport.png') },
];

// Produits
const featuredProducts = [
  { id: 1, name: 'iPhone 15 Pro', price: '999 FCFA', categoryId: 1, image: iphoneImage },
  { id: 2, name: 'MacBook Air M2', price: '1299 FCFA', categoryId: 1, image: macbookImage },
  // { id: 3, name: 'Robe élégante', price: '49 FCFA', categoryId: 2, image: robeImage },
  // { id: 4, name: 'Chaussures de sport', price: '89 FCFA', categoryId: 4, image: chaussuresImage },
  // { id: 5, name: 'Canapé confortable', price: '499 FCFA', categoryId: 3, image: canapeImage },
];

export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  const filteredProducts = selectedCategory
    ? featuredProducts.filter((product) => product.categoryId === selectedCategory.id)
    : featuredProducts.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );

  const openModal = (product) => {
    setSelectedProduct(product);
    setModalVisible(true);
  };

  const closeModal = () => {
    setSelectedProduct(null);
    setModalVisible(false);
  };

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

      <View style={styles.searchContainer}>
        <Search size={20} color="#9CA3AF" />
        <TextInput
          style={styles.searchPlaceholder}
          placeholder="Rechercher un produit..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <Text style={styles.sectionTitle}>Catégories</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
        {categories.map((category) => (
          <Pressable 
            key={category.id} 
            style={styles.categoryCard} 
            onPress={() => {
              setSelectedCategory(category);
              setSearchQuery('');
            }}
          >
            <Image source={category.image} style={styles.categoryImage} resizeMode="cover" />
            <Text style={styles.categoryName}>{category.name}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <Text style={styles.sectionTitle}>Pour vous</Text>
      <View style={[styles.productsGrid, isTablet && styles.tabletGrid]}>
        {filteredProducts.map((product) => (
          <Pressable 
            key={product.id} 
            style={[styles.productCard, isTablet && styles.tabletCard]} 
            onPress={() => openModal(product)}
          >
            <Image source={product.image} style={styles.productImage} resizeMode="cover" />
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
                source={selectedProduct.image}
                style={styles.modalImage}
                resizeMode="cover"
              />
              <Text style={styles.modalTitle}>{selectedProduct.name}</Text>
              <Text style={styles.modalPrice}>{selectedProduct.price}</Text>
              <Pressable 
                style={styles.addToCartButton} 
                onPress={() => addToCart(selectedProduct)}
              >
                <Text style={styles.addToCartButtonText}>Ajouter au panier</Text>
              </Pressable>
              <Pressable style={styles.closeButton} onPress={closeModal}>
                <X size={24} color="#FFFFFF" />
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
  // Modal-related styles
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
    color: '#1ABC9C',
    marginVertical: 8,
    textAlign: 'center',
  },
  addToCartButton: {
    marginTop: 16,
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
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
    width: '100%',
  },
});