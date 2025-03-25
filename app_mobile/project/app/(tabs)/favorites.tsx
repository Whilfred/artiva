import { View, Text, ScrollView, Image, StyleSheet, Pressable, useWindowDimensions } from 'react-native';
import { Heart } from 'lucide-react-native';

const favoriteProducts = [
  {
    id: 1,
    name: 'AirPods Max',
    price: '629 FCFA',
    image: 'https://images.unsplash.com/photo-1613040809024-b4ef7ba99bc3?w=500',
    category: 'Électronique'
  },
  {
    id: 2,
    name: 'Canapé Design',
    price: '1299 FCFA',
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500',
    category: 'Maison'
  },
  {
    id: 3,
    name: 'Running Shoes',
    price: '139 FCFA',
    image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500',
    category: 'Sport'
  },
];

export default function FavoritesScreen() {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Tendance</Text>
        <Text style={styles.subtitle}>{favoriteProducts.length} produits tendances</Text>
      </View>

      <ScrollView 
        contentContainerStyle={[
          styles.productsGrid,
          isTablet && styles.tabletGrid
        ]}
      >
        {favoriteProducts.map((product) => (
          <Pressable 
            key={product.id} 
            style={[styles.productCard, isTablet && styles.tabletCard]}
          >
            <View style={styles.imageContainer}>
              <Image source={{ uri: product.image }} style={styles.productImage} />
              <Pressable style={styles.heartButton}>
                <Heart size={24} fill="#FF4B55" color="#FF4B55" />
              </Pressable>
            </View>
            <View style={styles.productInfo}>
              <Text style={styles.categoryLabel}>{product.category}</Text>
              <Text style={styles.productName}>{product.name}</Text>
              <Text style={styles.productPrice}>{product.price}</Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
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
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontFamily: 'Poppins-Bold',
    fontSize: 28,
    color: '#1F2937',
  },
  subtitle: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: '#6B7280',
    marginTop: 4,
  },
  productsGrid: {
    padding: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  tabletGrid: {
    padding: 24,
    gap: 24,
  },
  productCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tabletCard: {
    minWidth: '30%',
  },
  imageContainer: {
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#F3F4F6',
  },
  heartButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  productInfo: {
    padding: 16,
  },
  categoryLabel: {
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  productName: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: '#1F2937',
    marginBottom: 8,
  },
  productPrice: {
    fontFamily: 'Poppins-Bold',
    fontSize: 18,
    color: '#FF4B55',
  },
});