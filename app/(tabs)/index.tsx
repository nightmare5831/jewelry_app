import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppStore } from '../../store/useAppStore';
import { useEffect, useMemo, useState } from 'react';
import { router } from 'expo-router';

const GOLDEN_RATIO = 0.618;

export default function CatalogScreen() {
  const {
    catalogMode,
    currentProductIndex,
    filteredProducts,
    currentFilterSet,
    selectedFilters,
    isLoading,
    error,
    selectedMediaIndex,
    setCatalogMode,
    nextProduct,
    previousProduct,
    selectFilter,
    goBackFilter,
    loadProducts,
    setSelectedMediaIndex,
    addToCart,
    authToken,
    isAuthenticated,
    cartItemsCount,
  } = useAppStore();

  const [addingToCart, setAddingToCart] = useState(false);

  // Load products from API on mount
  useEffect(() => {
    loadProducts();
  }, []);

  const currentProduct = filteredProducts[currentProductIndex];

  // Build media items array (video and images only - 3D removed)
  const mediaItems = useMemo(() => {
    if (!currentProduct) return [];
    const items = [];

    // 3D model feature removed

    // Add video (max 1)
    if (currentProduct.videos && currentProduct.videos[0]) {
      items.push({ type: 'video', url: currentProduct.videos[0] });
    }

    // Add images (max 4)
    if (currentProduct.images) {
      currentProduct.images.slice(0, 4).forEach(img => {
        items.push({ type: 'image', url: img });
      });
    }

    return items;
  }, [currentProduct]);

  // Show loading state
  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Carregando produtos...</Text>
      </View>
    );
  }

  // Show error state
  if (error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Ionicons name="cloud-offline-outline" size={64} color="#ef4444" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadProducts}>
          <Text style={styles.retryButtonText}>Tentar Novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handlePlusClick = () => {
    setCatalogMode(catalogMode === 'browse' ? 'detail' : 'browse');
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated || !authToken) {
      Alert.alert('Login Necessário', 'Por favor, faça login para adicionar produtos ao carrinho', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Fazer Login', onPress: () => router.push('/auth/login') },
      ]);
      return;
    }

    if (!currentProduct) return;

    setAddingToCart(true);
    try {
      await addToCart(parseInt(currentProduct.id), 1);
      Alert.alert('Sucesso!', 'Produto adicionado ao carrinho', [
        { text: 'Continuar Comprando', style: 'cancel' },
        { text: 'Ir para Carrinho', onPress: () => router.push('/(tabs)/cart') },
      ]);
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Falha ao adicionar ao carrinho');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleFilterClick = (filterId: string, filterType?: string) => {
    if (filterType === 'action') {
      // Handle action clicks (wallet, profile)
      if (filterId === 'wallet') {
        router.push('/(tabs)/cart');
      } else if (filterId === 'profile') {
        router.push('/(tabs)/profile');
      }
      return;
    }
    selectFilter(filterId);
  };

  // Dynamic left 4 icons (change based on filter selection)
  const leftIcons = currentFilterSet.slice(0, 4);

  // Always fixed: Wallet and Profile on right
  const walletIcon = { id: 'wallet', name: 'Carteira', icon: 'wallet', type: 'action' };
  const profileIcon = { id: 'profile', name: 'Perfil', icon: 'person', type: 'action' };

  return (
    <View style={styles.container}>

      {/* PRODUCT SECTION - 61.8% */}
      <View style={styles.productSection}>
        {currentProduct ? (
          <>
            {catalogMode === 'browse' ? (
              /* BROWSE MODE - Show thumbnail only */
              <>
                <Image
                  source={{ uri: currentProduct.thumbnail }}
                  style={styles.productImage}
                  resizeMode="cover"
                />
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.3)']}
                  style={styles.gradientOverlay}
                />
              </>
            ) : (
              /* DETAIL MODE - Show media viewer with slider */
              <View style={styles.mediaViewerContainer}>
                {/* Top: Main viewer (70%) */}
                <View style={styles.mainViewer}>
                  {mediaItems[selectedMediaIndex]?.type === 'image' && (
                    <Image
                      source={{ uri: mediaItems[selectedMediaIndex].url }}
                      style={styles.mainMedia}
                      resizeMode="contain"
                    />
                  )}
                  {mediaItems[selectedMediaIndex]?.type === 'video' && (
                    <View style={styles.videoPlaceholder}>
                      <Ionicons name="play-circle" size={80} color="#fff" />
                      <Text style={styles.placeholderText}>Video Player</Text>
                    </View>
                  )}
                </View>

                {/* Bottom: Thumbnail slider (30%) */}
                <View style={styles.thumbnailSlider}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {mediaItems.map((item, idx) => (
                      <TouchableOpacity
                        key={idx}
                        style={[
                          styles.thumbnailItem,
                          selectedMediaIndex === idx && styles.thumbnailItemActive
                        ]}
                        onPress={() => setSelectedMediaIndex(idx)}
                      >
                        {item.type === 'image' && (
                          <Image source={{ uri: item.url }} style={styles.thumbnailImage} />
                        )}
                        {item.type === 'video' && (
                          <View style={styles.thumbnailIcon}>
                            <Ionicons name="play" size={24} color="#fff" />
                          </View>
                        )}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>
            )}

            {/* Controls: HORIZONTAL - Plus and Arrows on same line */}
            <View style={styles.controlsOverlay}>
              <TouchableOpacity style={styles.plusButton} onPress={handlePlusClick}>
                <Ionicons
                  name={catalogMode === 'detail' ? 'close' : 'add'}
                  size={28}
                  color="#fff"
                />
              </TouchableOpacity>

              <TouchableOpacity style={styles.arrowButton} onPress={previousProduct}>
                <Ionicons name="play-back" size={24} color="#000" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.arrowButton} onPress={nextProduct}>
                <Ionicons name="play-forward" size={24} color="#000" />
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <Text style={styles.emptyText}>Nenhum produto</Text>
        )}
      </View>

      <View style={styles.divider} />

      {/* FILTER SECTION - 38.2% */}
      <View style={styles.filterSection}>

        {catalogMode === 'browse' ? (
          /* BROWSE MODE: Show filters */
          <View style={styles.filterGrid}>

            {/* LEFT SECTION - 60% (DYNAMIC 2x2 grid) */}
            <View style={styles.leftSection}>
              <View style={styles.gridRow}>
                <TouchableOpacity
                  style={styles.peopleCell}
                  onPress={() => handleFilterClick(leftIcons[0].id, leftIcons[0].type)}
                >
                  <Ionicons name={leftIcons[0].icon as any} size={56} color="#1f2937" />
                  <Text style={styles.filterLabel}>{leftIcons[0].name}</Text>
                </TouchableOpacity>

                <View style={styles.verticalDividerSmall} />

                <TouchableOpacity
                  style={styles.peopleCell}
                  onPress={() => handleFilterClick(leftIcons[1].id, leftIcons[1].type)}
                >
                  <Ionicons name={leftIcons[1].icon as any} size={56} color="#1f2937" />
                  <Text style={styles.filterLabel}>{leftIcons[1].name}</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.horizontalDivider} />

              <View style={styles.gridRow}>
                <TouchableOpacity
                  style={styles.peopleCell}
                  onPress={() => handleFilterClick(leftIcons[2].id, leftIcons[2].type)}
                >
                  <Ionicons name={leftIcons[2].icon as any} size={56} color="#1f2937" />
                  <Text style={styles.filterLabel}>{leftIcons[2].name}</Text>
                </TouchableOpacity>

                <View style={styles.verticalDividerSmall} />

                <TouchableOpacity
                  style={styles.peopleCell}
                  onPress={() => handleFilterClick(leftIcons[3].id, leftIcons[3].type)}
                >
                  <Ionicons name={leftIcons[3].icon as any} size={56} color="#1f2937" />
                  <Text style={styles.filterLabel}>{leftIcons[3].name}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.verticalDivider} />

            {/* RIGHT SECTION - 40% (Wallet + Profile on top, Cart on bottom) */}
            <View style={styles.rightSection}>

              {/* Top Row: Forum + Profile (FAB style icons) */}
              <View style={styles.topIconRow}>
                <TouchableOpacity
                  style={styles.fabStyleButton}
                  onPress={() => router.push('/(tabs)/forum')}
                >
                  <Ionicons name="chatbubbles" size={24} color="#ffffff" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.fabStyleProfileButton}
                  onPress={() => router.push('/(tabs)/profile')}
                >
                  <Ionicons name="person" size={24} color="#ffffff" />
                </TouchableOpacity>
              </View>

              <View style={styles.horizontalDivider} />

              {/* Bottom: Cart (FAB style, large) */}
              <TouchableOpacity
                style={styles.cartCell}
                onPress={() => router.push('/(tabs)/cart')}
              >
                <View style={styles.fabStyleCartButton}>
                  <Ionicons name="cart" size={28} color="#ffffff" />
                  {cartItemsCount > 0 && (
                    <View style={styles.cartBadgeInline}>
                      <Text style={styles.cartBadgeTextInline}>
                        {cartItemsCount}
                      </Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>

            </View>

          </View>
        ) : (
          /* DETAIL MODE: Show product info */
          <View style={styles.productDetailGrid}>
            <ScrollView style={styles.detailInfoSection} showsVerticalScrollIndicator={false}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Nome:</Text>
                <Text style={styles.detailValue}>{currentProduct?.name}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Preço:</Text>
                <Text style={styles.detailPrice}>R$ {currentProduct?.price.toFixed(2)}</Text>
                {currentProduct?.originalPrice && (
                  <Text style={styles.detailOriginalPrice}>
                    R$ {currentProduct.originalPrice.toFixed(2)}
                  </Text>
                )}
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Categoria:</Text>
                <Text style={styles.detailValue}>
                  {currentProduct?.category}
                  {currentProduct?.subcategory && ` / ${currentProduct.subcategory}`}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Avaliação:</Text>
                <View style={styles.ratingRow}>
                  <Ionicons name="star" size={16} color="#f59e0b" />
                  <Text style={styles.detailValue}>
                    {currentProduct?.rating} ({currentProduct?.reviewCount} avaliações)
                  </Text>
                </View>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Descrição:</Text>
                <Text style={styles.detailValue}>{currentProduct?.description}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Frete:</Text>
                <Text style={styles.detailValue}>
                  {currentProduct?.shipping.free ? 'Grátis' : `R$ 15.00`} - {currentProduct?.shipping.days} dias
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Material:</Text>
                <Text style={styles.detailValue}>Ouro 18k</Text>
              </View>

              {/* Add to Cart Button */}
              <TouchableOpacity
                style={[styles.addToCartButton, addingToCart && styles.addToCartButtonDisabled]}
                onPress={handleAddToCart}
                disabled={addingToCart}
              >
                {addingToCart ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <>
                    <Ionicons name="cart" size={20} color="#ffffff" />
                    <Text style={styles.addToCartText}>Adicionar ao Carrinho</Text>
                  </>
                )}
              </TouchableOpacity>
            </ScrollView>

            <View style={styles.verticalDivider} />

            {/* RIGHT SECTION - Wallet + Profile on top, Cart on bottom */}
            <View style={styles.rightSection}>

              {/* Top Row: Forum + Profile (FAB style icons) */}
              <View style={styles.topIconRow}>
                <TouchableOpacity
                  style={styles.fabStyleButton}
                  onPress={() => router.push('/(tabs)/forum')}
                >
                  <Ionicons name="chatbubbles" size={24} color="#ffffff" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.fabStyleProfileButton}
                  onPress={() => router.push('/(tabs)/profile')}
                >
                  <Ionicons name="person" size={24} color="#ffffff" />
                </TouchableOpacity>
              </View>

              <View style={styles.horizontalDivider} />

              {/* Bottom: Cart (FAB style, large) */}
              <TouchableOpacity
                style={styles.cartCell}
                onPress={() => router.push('/(tabs)/cart')}
              >
                <View style={styles.fabStyleCartButton}>
                  <Ionicons name="cart" size={28} color="#ffffff" />
                  {cartItemsCount > 0 && (
                    <View style={styles.cartBadgeInline}>
                      <Text style={styles.cartBadgeTextInline}>
                        {cartItemsCount}
                      </Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>

            </View>
          </View>
        )}

        {/* Bottom Left Corner - Filter/Back Button */}
        <TouchableOpacity
          style={styles.cornerButton}
          onPress={selectedFilters.length > 0 ? goBackFilter : () => {}}
        >
          <Ionicons
            name={selectedFilters.length > 0 ? 'arrow-back' : 'options-outline'}
            size={24}
            color="#1f2937"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },

  // PRODUCT SECTION
  productSection: {
    flex: GOLDEN_RATIO,
    backgroundColor: '#ffffff',
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  emptyText: {
    color: '#9ca3af',
    fontSize: 16,
    alignSelf: 'center',
    marginTop: '50%',
  },

  // Media Viewer (Detail Mode)
  mediaViewerContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  mainViewer: {
    flex: 0.7,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  mainMedia: {
    width: '100%',
    height: '100%',
  },
  videoPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1f2937',
  },
  modelPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#374151',
  },
  placeholderText: {
    color: '#fff',
    marginTop: 12,
    fontSize: 16,
  },
  thumbnailSlider: {
    flex: 0.3,
    backgroundColor: '#111',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  thumbnailItem: {
    width: 80,
    height: 80,
    marginHorizontal: 6,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: '#1f2937',
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnailItemActive: {
    borderColor: '#3b82f6',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  thumbnailIcon: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    backgroundColor: '#374151',
  },

  // Controls - HORIZONTAL: Plus and Arrows on same line
  controlsOverlay: {
    position: 'absolute',
    bottom: 16,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  plusButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#1f2937',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },

  arrowButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },

  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
  },

  // FILTER SECTION
  filterSection: {
    flex: 1 - GOLDEN_RATIO,
    backgroundColor: '#ffffff',
  },
  filterGrid: {
    flex: 1,
    flexDirection: 'row',
  },

  // LEFT SECTION - 60% (DYNAMIC)
  leftSection: {
    flex: 0.6,
  },
  gridRow: {
    flex: 1,
    flexDirection: 'row',
  },
  peopleCell: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: '#e5e7eb',
    backgroundColor: '#fafafa',
  },

  // RIGHT SECTION - 40% (ALWAYS FIXED)
  rightSection: {
    flex: 0.4,
  },

  // Top Icon Row - Forum + Logout horizontal (FAB style)
  topIconRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    backgroundColor: '#fafafa',
    borderWidth: 0.5,
    borderColor: '#e5e7eb',
    paddingVertical: 8,
  },

  // FAB Style Buttons (matching FABMenu.tsx)
  fabStyleButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 5,
  },
  fabStyleProfileButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 5,
  },

  // Cart Cell - Large bottom section (FAB style)
  cartCell: {
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: '#e5e7eb',
    backgroundColor: '#fafafa',
  },
  fabStyleCartButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#16a34a',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
    position: 'relative',
  },
  cartBadgeInline: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#dc2626',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  cartBadgeTextInline: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: 'bold',
  },

  // DETAIL MODE - Product info
  productDetailGrid: {
    flex: 1,
    flexDirection: 'row',
  },
  detailInfoSection: {
    flex: 0.6,
    padding: 16,
    backgroundColor: '#fafafa',
  },
  detailRow: {
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '500',
    lineHeight: 20,
  },
  detailPrice: {
    fontSize: 24,
    color: '#000',
    fontWeight: '800',
    marginBottom: 4,
  },
  detailOriginalPrice: {
    fontSize: 14,
    color: '#9ca3af',
    textDecorationLine: 'line-through',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  // Dividers
  verticalDivider: {
    width: 1,
    backgroundColor: '#e5e7eb',
  },
  verticalDividerSmall: {
    width: 1,
    backgroundColor: '#e5e7eb',
  },
  horizontalDivider: {
    height: 1,
    backgroundColor: '#e5e7eb',
  },

  // Labels
  filterLabel: {
    fontSize: 12,
    color: '#1f2937',
    fontWeight: '600',
    marginTop: 8,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  // Corner Button
  cornerButton: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 0.5,
    borderColor: '#e5e7eb',
  },

  // Loading state
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },

  // Error state
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  retryButton: {
    marginTop: 24,
    paddingHorizontal: 32,
    paddingVertical: 12,
    backgroundColor: '#3b82f6',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },

  // Add to Cart Button
  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#16a34a',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 20,
    marginBottom: 16,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addToCartButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  addToCartText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
