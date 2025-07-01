import { FontAwesome5 } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Easing,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Picker } from '@react-native-picker/picker'; // 引入Picker组件

const { width } = Dimensions.get('window');

export default function VideoDetect() {
  const [selectedVideo, setSelectedVideo] = useState();
  const [videoLink, setVideoLink] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadMethod, setUploadMethod] = useState(''); // 'link' 或 'local'
  const [isLinkValid, setIsLinkValid] = useState(true);
  const [progress, setProgress] = useState(0);
  const router = useRouter();
  
  // 新增：检测粒度相关状态
  const [detectionGranularity, setDetectionGranularity] = useState('coarse'); // 粗、中、细
  const [interval, setInterval] = useState(2); // 默认粗粒度对应的间隔
  
  // 动画相关状态
  const fadeAnim = useState(new Animated.Value(0))[0];
  const scaleAnim = useState(new Animated.Value(0.95))[0];
  const progressAnim = useRef(new Animated.Value(0)).current;
  
  // 监听粒度变化，更新interval
  useEffect(() => {
    switch(detectionGranularity) {
      case 'coarse':
        setInterval(2);
        break;
      case 'medium':
        setInterval(1);
        break;
      case 'fine':
        setInterval(0.5);
        break;
      default:
        setInterval(2);
    }
    console.log(`检测粒度: ${detectionGranularity}, 间隔: ${interval}秒`);
  }, [detectionGranularity]);

  useEffect(() => {
    // 初始化媒体库权限
    (async () => {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        alert('需要媒体库权限以选择视频');
      }
    })();
    
    // 启动页面进入动画
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // 验证URL是否有效
  const validateUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };

  const handleLinkChange = (text) => {
    setVideoLink(text);
    setIsLinkValid(validateUrl(text) || text === '');
    if (text && uploadMethod !== 'link') {
      setUploadMethod('link');
      setSelectedVideo(null);
    } else if (!text && uploadMethod === 'link') {
      setUploadMethod('');
    }
  };

  const pickVideoAsync = async () => {
    setIsLoading(true);
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['videos'],
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedVideo(result.assets[0].uri);
      setUploadMethod('local');
      setVideoLink('');
    } else {
      alert('你没有选择任何视频');
    }
    setIsLoading(false);
  };
  const detectVideos = async () => {
    if (!selectedVideo && !videoLink) {
      alert('请选择一个视频或输入视频链接');
      return;
    }

    if (videoLink && !isLinkValid) {
      alert('请输入有效的视频链接');
      return;
    }
    // 生成新的文件名
    const fileName = `video_${Date.now()}.mp4`;
    let newUri = "";
    if(selectedVideo){
      try {
        newUri = FileSystem.documentDirectory + fileName;
        // 复制图片到持久存储
        await FileSystem.copyAsync({
          from: selectedVideo,
          to: newUri,
        });
        console.log('视频保存成功，新的 uri:', newUri);
      } catch (error) {
          console.error('保存视频时出错:', error);
      }
    }
    setIsProcessing(true);
    setProgress(0);
    
    // 模拟处理进度，使用当前interval值（这里仅作为示例，实际应用中可能需要根据interval调整处理逻辑）
    const processingDuration = 1500 * (2 / interval); // 根据interval调整处理时长
    Animated.timing(progressAnim, {
      toValue: 100,
      duration: processingDuration,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) {
        router.push({
          pathname: '/videoResult',
          params: {
            percentage: 60,
            newflag: 1,
            videoUri: newUri || "",
            videoLink: videoLink || "",
            // 传递检测粒度和interval到结果页面
            detectionGranularity: detectionGranularity,
            interval: interval,
          },
        });


        setIsProcessing(false);
      }
    });
    
    progressAnim.addListener(({ value }) => {
      setProgress(value);
    });
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            keyboardShouldPersistTaps="handled"
          >
            <Animated.View style={[styles.contentContainer, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
              {/* 页面标题 */}
              <View style={styles.header}>
                <View style={styles.logoContainer}>
                  <FontAwesome5 name="video" size={40} color="#4F46E5" />
                  <Text style={styles.appName}>VideoAI</Text>
                </View>
                <Text style={styles.tagline}>视频检测功能</Text>
              </View>

              {/* 视频上传区域 */}
              <View style={styles.videoContainer}>
                <Text style={styles.sectionTitle}>上传视频</Text>
                
                {/* 选择上传方式 */}
                <View style={styles.uploadMethodContainer}>
                  <TouchableOpacity
                    style={[
                      styles.methodButton,
                      uploadMethod === 'link' ? styles.methodButtonActive : null,
                    ]}
                    onPress={() => {
                      setUploadMethod('link');
                      setSelectedVideo(null);
                    }}
                  >
                    <FontAwesome5 name="link" size={20} color={uploadMethod === 'link' ? '#FFFFFF' : '#4F46E5'} />
                    <Text style={[
                      styles.methodButtonText,
                      uploadMethod === 'link' ? styles.methodButtonTextActive : null,
                    ]}>链接上传</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.methodButton,
                      { marginRight: 0 }, // 移除最后一个按钮的右边距
                      uploadMethod === 'local' ? styles.methodButtonActive : null,
                    ]}
                    onPress={() => {
                      setUploadMethod('local');
                      setVideoLink('');
                    }}
                  >
                    <FontAwesome5 name="file-video" size={20} color={uploadMethod === 'local' ? '#FFFFFF' : '#4F46E5'} />
                    <Text style={[
                      styles.methodButtonText,
                      uploadMethod === 'local' ? styles.methodButtonTextActive : null,
                    ]}>本地视频</Text>
                  </TouchableOpacity>
                </View>
                
                {/* 新增：检测粒度选择下拉框 */}
                <View style={styles.granularityContainer}>
                  <Text style={styles.label}>检测粒度</Text>
                  <View style={styles.pickerContainer}>
                    <Picker
                      style={styles.picker}
                      selectedValue={detectionGranularity}
                      onValueChange={(itemValue) => setDetectionGranularity(itemValue)}
                    >
                      <Picker.Item label="粗粒度" value="coarse" />
                      <Picker.Item label="中粒度" value="medium" />
                      <Picker.Item label="细粒度" value="fine" />
                    </Picker>
                    <FontAwesome5 name="sliders-h" size={20} color="#4F46E5" style={styles.pickerIcon} />
                  </View>
                </View>

                {/* 视频链接输入框 */}
                {uploadMethod === 'link' && (
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>视频链接</Text>
                    <TextInput
                      style={[
                        styles.input,
                        !isLinkValid && videoLink ? styles.invalidInput : null,
                      ]}
                      placeholder="请输入有效的视频链接"
                      value={videoLink}
                      placeholderTextColor="#8E939A"
                      onChangeText={handleLinkChange}
                    />
                    {!isLinkValid && videoLink && (
                      <Text style={styles.errorText}>请输入有效的URL</Text>
                    )}
                  </View>
                )}

                {/* 选择本地视频按钮 */}
                {uploadMethod === 'local' && (
                  <TouchableOpacity
                    style={styles.pickButton}
                    onPress={pickVideoAsync}
                  >
                    <FontAwesome5 name="video" size={24} color="#FFFFFF" />
                    <Text style={styles.pickButtonText}>选择本地视频</Text>
                  </TouchableOpacity>
                )}

                {/* 视频加载指示器 */}
                {isLoading && (
                  <View style={styles.loadingIndicator}>
                    <ActivityIndicator size="small" color="#4F46E5" />
                    <Text style={styles.loadingText}>加载视频中...</Text>
                  </View>
                )}

                {/* 已选择视频提示 */}
                {(selectedVideo || videoLink) && (
                  <View style={styles.selectedVideoInfo}>
                    <FontAwesome5 name="check-circle" size={18} color="#10B981" style={{ marginRight: 8 }} />
                    <Text style={styles.selectedVideoText}>
                      {selectedVideo 
                        ? `已选择视频: ${selectedVideo.substring(selectedVideo.lastIndexOf('/') + 1)}`
                        : `已输入链接: ${videoLink}`
                      }
                    </Text>
                    {/* 显示当前检测粒度 */}
                    <Text style={styles.granularityDisplay}>
                      检测粒度: {
                        detectionGranularity === 'coarse' ? '粗' :
                        detectionGranularity === 'medium' ? '中' : '细'
                      }
                    </Text>
                  </View>
                )}

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
                      <View style={styles.progressContainer}>
                        <View style={styles.progressBar}>
                          <Animated.View 
                            style={[
                              styles.progressFill, 
                              { width: `${progress}%` }
                            ]}
                          />
                        </View>
                        <Text style={styles.progressText}>{Math.round(progress)}%</Text>
                      </View>
                      {/* 显示处理间隔 */}
                      <Text style={styles.intervalDisplay}>
                        检测间隔: {interval} 秒
                      </Text>
                    </View>
                  </View>
                )}
              </View>

              {/* 检测按钮 */}
              <Pressable
                style={({ pressed }) => [
                  styles.detectButton,
                  pressed ? styles.detectButtonPressed : null,
                ]}
                onPress={detectVideos}
                disabled={!selectedVideo && !videoLink}
              >
                <Text style={styles.detectButtonText}>开始检测</Text>
              </Pressable>
              
              {/* 页脚 */}
              <View style={styles.footer}>
                <Text style={styles.footerText}>© 2025 VideoAI 视频检测功能</Text>
              </View>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  safeArea: {
    flex: 1,
  },
  scrollContainer: {
    padding: 20,
  },
  contentContainer: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 20,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 10,
  },
  tagline: {
    fontSize: 16,
    color: '#94A3B8',
  },
  videoContainer: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 24,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#F8FAFC',
    marginBottom: 20,
  },
  uploadMethodContainer: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  methodButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 8,
    padding: 14,
    marginRight: 8,
    backgroundColor: '#0F172A',
  },
  methodButtonActive: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  methodButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#CBD5E1',
    marginLeft: 8,
  },
  methodButtonTextActive: {
    color: '#FFFFFF',
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#E2E8F0',
  },
  input: {
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    color: '#F8FAFC',
  },
  invalidInput: {
    borderColor: '#EF4444',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    marginTop: 6,
  },
  pickButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4F46E5',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  pickButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
  },
  loadingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  loadingText: {
    color: '#CBD5E1',
    fontSize: 16,
    marginLeft: 10,
  },
  selectedVideoInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
    borderRadius: 4,
    padding: 12,
    marginBottom: 24,
  },
  selectedVideoText: {
    color: '#E2E8F0',
    fontSize: 15,
    flex: 1,
    marginRight: 10,
  },
  granularityDisplay: {
    color: '#94A3B8',
    fontSize: 14,
    marginTop: 4,
    width: '100%',
  },
  processingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
  },
  processingIndicator: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 10,
  },
  spinner: {
    marginBottom: 12,
  },
  processingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F8FAFC',
  },
  progressContainer: {
    marginTop: 16,
    width: '100%',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#334155',
    borderRadius: 3,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4F46E5',
    borderRadius: 3,
    width: 0,
  },
  progressText: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'right',
  },
  intervalDisplay: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 8,
  },
  detectButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 8,
    padding: 18,
    alignItems: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
    transition: 'all 0.2s',
  },
  detectButtonPressed: {
    backgroundColor: '#4338CA',
    transform: [{ scale: 0.98 }],
  },
  detectButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  footer: {
    marginTop: 40,
    marginBottom: 20,
    alignItems: 'center',
  },
  footerText: {
    color: '#64748B',
    fontSize: 14,
  },
  // 新增：检测粒度选择器样式
  granularityContainer: {
    marginBottom: 24,
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 8,
    paddingHorizontal: 14,
    height: 50,
  },
  picker: {
    flex: 1,
    color: '#F8FAFC',
    marginRight: 10,
  },
  pickerIcon: {
    marginLeft: 10,
  },
});