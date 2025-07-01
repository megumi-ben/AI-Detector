import { FontAwesome, FontAwesome5, Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { captureRef } from 'react-native-view-shot';

import EmojiList from '@/components/EmojiList';
import EmojiPicker from '@/components/EmojiPicker';
import EmojiSticker from '@/components/EmojiSticker';
import ImageViewer from '@/components/ImageViewer';
import * as FileSystem from 'expo-file-system';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');
const PlaceholderImage = require('@/assets/images/dog.jpeg');

export default function Index() {
  const [selectedImage, setSelectedImage] = useState();
  const [showAppOptions, setShowAppOptions] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [pickedEmoji, setPickedEmoji] = useState();
  const [status, requestPermission] = MediaLibrary.usePermissions();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isButtonPressed, setIsButtonPressed] = useState(false);
  const [isPrimaryButtonPressed, setIsPrimaryButtonPressed] = useState(false);
  const [isOptionButtonPressed, setIsOptionButtonPressed] = useState({
    reset: false,
    sticker: false,
    save: false
  });
  
  const imageRef = useRef(null);
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  // 加载动画效果
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 7,
        tension: 100,
        useNativeDriver: true,
      })
    ]).start();
    
    // 按钮脉冲动画
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    
    const pulseSubscription = pulse.start();
    return () => pulseSubscription.stop();
  }, []);

  if (status === null) {
    requestPermission();
  }

  const pickImageAsync = async () => {
    setIsLoading(true);
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      setShowAppOptions(true);
    } else {
      alert('You did not select any image.');
    }
    setIsLoading(false);
  };

  const onReset = () => {
    setShowAppOptions(false);
    setPickedEmoji(undefined);
    setZoomLevel(1);
  };

  const onAddSticker = () => {
    setIsModalVisible(true);
  };

  const onModalClose = () => {
    setIsModalVisible(false);
  };

  const detectImg = async () => {
    if (!selectedImage) return;
    
    setIsProcessing(true);
    console.log("selectedImage:", selectedImage);
    
    // 生成新的文件名
    const fileName = `image_${Date.now()}.jpg`;
    const newUri = FileSystem.documentDirectory + fileName;

    if(selectedImage){
      try {
        // 复制图片到持久存储
        await FileSystem.copyAsync({
          from: selectedImage,
          to: newUri,
        });
        console.log('图片保存成功，新的 uri:', newUri);
      } catch (error) {
          console.error('保存图片时出错:', error);
      }
    }
    
    // 添加延迟以显示处理状态
    setTimeout(() => {
      router.push({
        pathname: '/imgResult',
        params: { 
          percentage: 60,
          newflag: 1,
          imgUri: newUri,
        },
      });
      setIsProcessing(false);
    }, 1500);
  }

  const onSaveImageAsync = async () => {
    if (!selectedImage) return;
    
    setIsProcessing(true);
    
    try {
      const localUri = await captureRef(imageRef, {
        height: 440,
        quality: 1,
      });

      await MediaLibrary.saveToLibraryAsync(localUri);
      if (localUri) {
        alert('Saved!');
        console.log("localUri", localUri);
      }
    } catch (e) {
      console.log(e);
    } finally {
      setIsProcessing(false);
    }
  }
  
  const onZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.1, 1.5));
  };
  
  const onZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.1, 0.5));
  };
  
  const handleOptionButtonPress = (buttonType) => {
    setIsOptionButtonPressed(prev => ({
      ...prev,
      [buttonType]: true
    }));
  };
  
  const handleOptionButtonRelease = (buttonType) => {
    setIsOptionButtonPressed(prev => ({
      ...prev,
      [buttonType]: false
    }));
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#161625" />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View style={[styles.contentContainer, { 
            opacity: fadeAnim, 
            transform: [{ scale: scaleAnim }] 
          }]}>
            {/* 页面标题 */}
            <View style={styles.header}>
              <Text style={styles.appName}>ImgDetect</Text>
              <Text style={styles.tagline}>图像检测功能</Text>
            </View>
            
            {/* 图像处理区域 */}
            <View style={styles.imageContainer}>
              <View 
                ref={imageRef} 
                collapsable={false}
                style={styles.imageWrapper}
              >
                <View 
                  style={[
                    styles.imageContent,
                    { transform: [{ scale: zoomLevel }] }
                  ]}
                >
                  <ImageViewer 
                    imgSource={PlaceholderImage} 
                    selectedImage={selectedImage} 
                    style={styles.imageViewer}
                  />
                  {pickedEmoji && <EmojiSticker imageSize={40} stickerSource={pickedEmoji} />}
                </View>
                
                {/* 处理中状态覆盖层 */}
                {isProcessing && (
                  <View style={styles.processingOverlay}>
                    <View style={styles.processingIndicator}>
                      <ActivityIndicator 
                        size="large" 
                        color="#4F46E5" 
                        style={styles.spinner} 
                      />
                      <Text style={styles.processingText}>处理中...</Text>
                    </View>
                  </View>
                )}
                
                {/* 空状态提示 */}
                {!selectedImage && !showAppOptions && (
                  <View style={styles.emptyState}>
                    <View style={styles.emptyStateIcon}>
                      <FontAwesome5 name="image" size={48} color="#4F46E5" />
                    </View>
                    <Text style={styles.emptyStateTitle}>选择一张图片</Text>
                    <Text style={styles.emptyStateDescription}>
                      开始编辑、添加贴纸或检测图像内容
                    </Text>
                  </View>
                )}
              </View>
              
              {/* 图片加载指示器 */}
              {isLoading && (
                <View style={styles.loadingIndicator}>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <Text style={styles.loadingText}>加载图片中...</Text>
                </View>
              )}
              
              {/* 缩放控制 */}
              {showAppOptions && (
                <View style={styles.zoomControls}>
                  <TouchableOpacity 
                    style={styles.zoomButton}
                    onPress={onZoomOut}
                  >
                    <FontAwesome name="search-minus" size={18} color="#FFFFFF" />
                  </TouchableOpacity>
                  <Text style={styles.zoomLevelText}>{Math.round(zoomLevel * 100)}%</Text>
                  <TouchableOpacity 
                    style={styles.zoomButton}
                    onPress={onZoomIn}
                  >
                    <FontAwesome name="search-plus" size={18} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* 操作按钮区域 */}
            {showAppOptions ? (
              <View style={styles.optionsContainer}>
                <View style={styles.optionsRow}>
                  {/* 重置按钮 */}
                  <Pressable
                    style={[
                      styles.optionButton, 
                      styles.resetButton,
                      isOptionButtonPressed.reset && styles.optionButtonPressed
                    ]} 
                    onPress={onReset}
                    onPressIn={() => handleOptionButtonPress('reset')}
                    onPressOut={() => handleOptionButtonRelease('reset')}
                  >
                    <FontAwesome name="refresh" size={22} color="#FFFFFF" />
                    <Text style={styles.optionText}>重置</Text>
                  </Pressable>
                  
                  {/* 添加贴纸按钮 */}
                  <Pressable
                    style={[
                      styles.optionButton, 
                      styles.addStickerButton,
                      isOptionButtonPressed.sticker && styles.optionButtonPressed
                    ]} 
                    onPress={onAddSticker}
                    onPressIn={() => handleOptionButtonPress('sticker')}
                    onPressOut={() => handleOptionButtonRelease('sticker')}
                  >
                    <FontAwesome name="smile-o" size={22} color="#FFFFFF" />
                    <Text style={styles.optionText}>添加贴纸</Text>
                  </Pressable>
                  
                  {/* 保存按钮 */}
                  <Pressable
                    style={[
                      styles.optionButton, 
                      styles.saveButton,
                      isOptionButtonPressed.save && styles.optionButtonPressed
                    ]} 
                    onPress={onSaveImageAsync}
                    onPressIn={() => handleOptionButtonPress('save')}
                    onPressOut={() => handleOptionButtonRelease('save')}
                  >
                    <FontAwesome name="save" size={22} color="#FFFFFF" />
                    <Text style={styles.optionText}>保存</Text>
                  </Pressable>
                </View>
                
                {/* 检测按钮 - 只有选择了图片才显示 */}
                {selectedImage && (
                  <Animated.View style={[
                    styles.detectButtonContainer,
                    { transform: [{ scale: pulseAnim }] }
                  ]}>
                    <Pressable
                      style={[
                        styles.detectButton,
                        isButtonPressed && styles.detectButtonPressed,
                        isProcessing && styles.processingButton
                      ]} 
                      onPress={detectImg}
                      disabled={isProcessing}
                      onPressIn={() => !isProcessing && setIsButtonPressed(true)}
                      onPressOut={() => setIsButtonPressed(false)}
                    >
                      {isProcessing ? (
                        <View style={styles.processingButtonContent}>
                          <ActivityIndicator size="small" color="#FFFFFF" />
                          <Text style={styles.detectButtonText}>检测中...</Text>
                        </View>
                      ) : (
                        <Text style={styles.detectButtonText}>
                          <Ionicons name="scan-outline" size={18} style={styles.iconLeft} />
                          检测图像
                          <Ionicons name="arrow-forward" size={18} style={styles.iconRight} />
                        </Text>
                      )}
                    </Pressable>
                  </Animated.View>
                )}
              </View>
            ) : (
              <View style={styles.initialOptionsContainer}>
                <Pressable
                  style={[
                    styles.primaryButton,
                    isPrimaryButtonPressed && styles.primaryButtonPressed
                  ]}
                  onPress={pickImageAsync}
                  onPressIn={() => setIsPrimaryButtonPressed(true)}
                  onPressOut={() => setIsPrimaryButtonPressed(false)}
                >
                  <Text style={styles.primaryButtonText}>
                    <FontAwesome name="image" size={18} style={styles.iconLeft} />
                    选择照片
                  </Text>
                </Pressable>
                
                <View style={styles.featureHighlights}>
                  <View style={styles.featureItem}>
                    <FontAwesome5 name="check-circle" size={16} color="#4ECDC4" />
                    <Text style={styles.featureText}>AI智能检测</Text>
                  </View>
                  <View style={styles.featureItem}>
                    <FontAwesome5 name="check-circle" size={16} color="#4ECDC4" />
                    <Text style={styles.featureText}>贴纸装饰</Text>
                  </View>
                  <View style={styles.featureItem}>
                    <FontAwesome5 name="check-circle" size={16} color="#4ECDC4" />
                    <Text style={styles.featureText}>高质量输出</Text>
                  </View>
                </View>
              </View>
            )}
            
            {/* 页脚信息 */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>ImgDetect v1.0.0</Text>
              <Text style={styles.footerText}>© 2025 All rights reserved</Text>
            </View>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>

      {/* 贴纸选择器 */}
      <EmojiPicker isVisible={isModalVisible} onClose={onModalClose}>
        <EmojiList onSelect={setPickedEmoji} onCloseModal={onModalClose} />
      </EmojiPicker>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#161625',
  },
  safeArea: {
    flex: 1,
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  contentContainer: {
    minHeight: '100%',
    justifyContent: 'space-between',
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textShadowColor: 'rgba(79, 70, 229, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  tagline: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 4,
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 32,
    backgroundColor: 'rgba(30, 41, 59, 0.3)',
    borderRadius: 12,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#94A3B8',
  },
  imageContainer: {
    marginVertical: 16,
    position: 'relative',
  },
  imageWrapper: {
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: 'rgba(79, 70, 229, 0.2)',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    aspectRatio: 3/4,
    marginHorizontal: 10,
    borderWidth: 1,
    borderColor: 'rgba(79, 70, 229, 0.1)',
  },
  imageContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageViewer: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  processingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(22, 22, 37, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 24,
  },
  processingIndicator: {
    backgroundColor: 'rgba(30, 41, 59, 0.9)',
    padding: 24,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: 'rgba(79, 70, 229, 0.5)',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  spinner: {
    marginRight: 12,
  },
  processingText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  emptyState: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(22, 22, 37, 0.7)',
    borderRadius: 24,
  },
  emptyStateIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(79, 70, 229, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(79, 70, 229, 0.2)',
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  emptyStateDescription: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    maxWidth: '70%',
  },
  loadingIndicator: {
    position: 'absolute',
    bottom: 16,
    left: '50%',
    transform: [{ translateX: -80 }],
    backgroundColor: 'rgba(22, 22, 37, 0.8)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 14,
    marginLeft: 8,
  },
  zoomControls: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: 'rgba(22, 22, 37, 0.8)',
    borderRadius: 20,
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  zoomButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(79, 70, 229, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  zoomLevelText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginHorizontal: 8,
  },
  optionsContainer: {
    marginVertical: 32,
    paddingBottom: 24,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 40,
  },
  optionButton: {
    width: 88,
    height: 88,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
    transform: [{ scale: 1 }],
    transition: 'all 0.2s ease',
  },
  optionButtonPressed: {
    transform: [{ scale: 0.95 }],
    shadowOpacity: 0.3,
  },
  resetButton: {
    backgroundColor: 'rgba(79, 70, 229, 0.8)',
  },
  addStickerButton: {
    backgroundColor: 'rgba(236, 72, 153, 0.8)',
  },
  saveButton: {
    backgroundColor: 'rgba(24, 211, 173, 0.8)',
  },
  optionText: {
    marginTop: 10,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  detectButtonContainer: {
    paddingHorizontal: 16,
  },
  detectButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 24,
    paddingVertical: 18,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
    alignItems: 'center',
    transform: [{ scale: 1 }],
    transition: 'all 0.2s ease',
  },
  detectButtonPressed: {
    transform: [{ scale: 0.98 }],
    shadowOpacity: 0.4,
  },
  detectButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
  processingButton: {
    backgroundColor: '#334155',
    shadowColor: '#334155',
  },
  processingButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  initialOptionsContainer: {
    marginVertical: 32,
    paddingBottom: 24,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 24,
    paddingVertical: 18,
    paddingHorizontal: 32,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
    width: '80%',
    maxWidth: 300,
    alignItems: 'center',
    transform: [{ scale: 1 }],
    transition: 'all 0.2s ease',
  },
  primaryButtonPressed: {
    transform: [{ scale: 0.98 }],
    shadowOpacity: 0.4,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureHighlights: {
    marginTop: 32,
    width: '80%',
    maxWidth: 300,
    backgroundColor: 'rgba(30, 41, 59, 0.3)',
    borderRadius: 16,
    padding: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  featureText: {
    color: '#94A3B8',
    fontSize: 14,
    marginLeft: 8,
  },
  footer: {
    marginTop: 40,
    marginBottom: 20,
    alignItems: 'center',
  },
  footerText: {
    color: '#64748B',
    fontSize: 12,
  },
});
