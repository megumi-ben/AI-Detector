import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import mammoth from "mammoth";
import { useEffect, useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import {
  Avatar,
  Button,
  Card,
  HelperText,
  ProgressBar,
  Title
} from 'react-native-paper';

const DocumentUploadScreen = () => {
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [extractedText, setExtractedText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [error, setError] = useState(null);
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState('');
  const [uploadStatus, setUploadStatus] = useState('');
  const router = useRouter();

  useEffect(() => {
    const checkSharingAvailable = async () => {
      if (!(await Sharing.isAvailableAsync())) {
        setError('文件共享功能在当前设备上不可用');
      }
    };
    checkSharingAvailable();
  }, []);

  const pickDocument = async () => {
    try {
      setIsProcessing(true);
      setError(null);
      setUploadStatus('');

      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });
      console.log("getDocumentAsync---result:", result);
      if (result.canceled === false && result.assets) {
        setSelectedDocument(result);
        setFileName(result.assets[0].name);
        setFileSize(formatFileSize(result.assets[0].size));
        setExtractedText('');
        setUploadStatus('文件已选择，点击"提取文本内容"开始处理');
      } else {
        setError('未选择任何文件');
      }
    } catch (err) {
      console.error('选择文档时出错:', err);
      setError('选择文档时出错: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const extractTextFromDocument = async () => {
    if (!selectedDocument) {
      setError('请先选择一个文档');
      return;
    }

    try {
      setIsProcessing(true);
      setProcessingProgress(0);
      setError(null);
      setExtractedText('');
      setUploadStatus('开始上传文档...');

      for (let i = 1; i <= 10; i++) {
        await new Promise(resolve => setTimeout(resolve, 200));
        setProcessingProgress(i * 10);
        setUploadStatus(`上传中: ${i * 10}%`);
      }

      setUploadStatus('文档上传成功，正在提取文本...');

      const fileUri = selectedDocument.assets[0].uri;
      let text = await FileSystem.readAsStringAsync(fileUri,
        {encoding: FileSystem.EncodingType.Base64,}
      );
      console.log("selectedDocument: ",selectedDocument);
      console.log("selectedDocument.assets[0].name: ",selectedDocument.assets[0].name);
      console.log("fileUri: ",fileUri);
      const binaryString = atob(text); // base64 是原始内容
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const arrayBuffer = bytes.buffer;
      if(fileUri.endsWith(".docx")){
        const result1=await mammoth.extractRawText({arrayBuffer:arrayBuffer});
        text = result1.value;
        console.log("docx: ",text);
      }else if(fileUri.endsWith(".pdf")){
        //zanwu
        console.log("pdf:",text);
      }
      setExtractedText(text);
      setUploadStatus('文本提取完成');
    } catch (err) {
      console.error('提取文本时出错:', err);
      setError('处理文档时出错: ' + err.message);
      setUploadStatus('处理失败');
    } finally {
      setIsProcessing(false);
    }
  };

  const shareExtractedText = async () => {
    if (!extractedText) {
      setError('没有可共享的提取文本');
      return;
    }

    try {
      const fileUri = FileSystem.cacheDirectory + 'extracted_text.txt';
      await FileSystem.writeAsStringAsync(fileUri, extractedText);
      await Sharing.shareAsync(fileUri, {
        mimeType: 'text/plain',
        dialogTitle: '分享提取的文本',
      });
    } catch (err) {
      console.error('分享文本时出错:', err);
      setError('分享文本时出错: ' + err.message);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleStartDetection = () => {
    console.log('开始检测输入的文本:', extractedText);
    router.push({
      pathname: 'result',
      params: { 
        inputText: extractedText,
        percentage: 60,
        newflag: 1,
      },
    });
    console.log('执行跳转后');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.header}>
          <Avatar.Icon
            icon="file-document-outline"
            size={64}
            style={styles.headerIcon}
          />
          <Text style={styles.title}>文档检测</Text>
          <Text style={styles.subtitle}>上传并提取文档中的文本内容</Text>
        </View>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>选择文档</Text>
            <Text style={styles.cardSubtitle}>支持 Word、PDF、TXT 等格式</Text>

            {error && (
              <HelperText type="error" visible={!!error}>
                {error}
              </HelperText>
            )}

            <Button
              icon="file-upload"
              mode="contained"
              style={styles.uploadButton}
              onPress={pickDocument}
              disabled={isProcessing}
            >
              选择文档
            </Button>

            {selectedDocument && (
              <View style={styles.fileInfoContainer}>
                <View style={styles.fileIconContainer}>
                  <MaterialCommunityIcons
                    name="file-document"
                    size={48}
                    color="#6200EE"
                  />
                </View>
                <View style={styles.fileDetails}>
                  <Text style={styles.fileName} numberOfLines={1}>
                    {fileName}
                  </Text>
                  <Text style={styles.fileSize}>{fileSize}</Text>
                </View>
              </View>
            )}

            {uploadStatus && (
              <View style={styles.uploadStatusContainer}>
                <Text style={styles.uploadStatusText}>{uploadStatus}</Text>
              </View>
            )}

            {isProcessing && (
              <View style={styles.progressContainer}>
                <ProgressBar
                  progress={processingProgress / 100}
                  color="#6200EE"
                />
                <Text style={styles.progressText}>
                  进度: {processingProgress}%
                </Text>
              </View>
            )}

            {selectedDocument && !isProcessing && (
              <Button
                icon="file-document-edit"
                mode="contained"
                style={styles.processButton}
                onPress={extractTextFromDocument}
              >
                提取文本内容
              </Button>
            )}
          </Card.Content>
        </Card>

        {extractedText && (
          <Card style={styles.resultCard}>
            <Card.Content>
              <Title style={styles.cardTitle}>提取结果</Title>

              <View style={styles.resultActions}>
                <Button
                  icon="content-copy"
                  mode="text"
                  onPress={() => Alert.alert('功能提示', '复制功能将在实际应用中实现')}
                >
                  复制
                </Button>
                <Button
                  icon="file-download"
                  mode="text"
                  onPress={() => Alert.alert('功能提示', '下载功能将在实际应用中实现')}
                >
                  下载
                </Button>
                <Button
                  icon="share"
                  mode="text"
                  onPress={shareExtractedText}
                >
                  分享
                </Button>
              </View>

              <View style={styles.textResultContainer}>
                <TextInput
                  style={styles.textInput}
                  value={extractedText}
                  multiline
                  numberOfLines={5}
                />
              </View>
            </Card.Content>
          </Card>
        )}
      </ScrollView>
      {extractedText && (
        <View style={styles.bottomButtonContainer}>
          <Button
            icon="magnify"
            mode="contained"
            style={styles.detectionButton}
            onPress={handleStartDetection}
          >
            进行检测
          </Button>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollViewContent: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: 16,
  },
  headerIcon: {
    backgroundColor: '#6200EE',
    marginBottom: 12,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#aaa',
    fontSize: 16,
  },
  card: {
    backgroundColor: '#121212',
    marginBottom: 16,
    elevation: 4,
  },
  cardTitle: {
    color: '#fff',
    marginBottom: 8,
  },
  cardSubtitle: {
    color: '#aaa',
    marginBottom: 16,
  },
  uploadButton: {
    marginBottom: 16,
    backgroundColor: '#6200EE',
  },
  processButton: {
    marginTop: 16,
    backgroundColor: '#BB86FC',
  },
  fileInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#1E1E1E',
    borderRadius: 8,
    marginBottom: 16,
  },
  fileIconContainer: {
    marginRight: 12,
    padding: 8,
    backgroundColor: '#2D2D2D',
    borderRadius: 8,
  },
  fileDetails: {
    flex: 1,
  },
  fileName: {
    color: '#fff',
    fontWeight: '500',
  },
  fileSize: {
    color: '#aaa',
    fontSize: 12,
  },
  uploadStatusContainer: {
    marginVertical: 8,
    padding: 8,
    backgroundColor: '#2D2D2D',
    borderRadius: 4,
  },
  uploadStatusText: {
    color: '#BB86FC',
    fontSize: 14,
    textAlign: 'center',
  },
  progressContainer: {
    marginVertical: 16,
  },
  progressText: {
    color: '#fff',
    fontSize: 12,
    marginTop: 4,
  },
  resultCard: {
    backgroundColor: '#121212',
    elevation: 4,
  },
  resultActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 12,
  },
  textResultContainer: {
    height: 200,
    backgroundColor: '#1E1E1E',
    borderRadius: 8,
    padding: 12,
  },
  textInput: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
  bottomButtonContainer: {
    padding: 16,
    backgroundColor: '#000',
    borderTopWidth: 1,
    borderTopColor: '#2D2D2D',
  },
  detectionButton: {
    backgroundColor: '#6200EE',
    borderRadius: 5,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  }
});

export default DocumentUploadScreen;