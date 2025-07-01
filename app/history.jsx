import bgImage from '@/assets/images/bg6.jpg';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import * as FileSystem from 'expo-file-system';
import { Image, ImageBackground } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SegmentedButtons } from 'react-native-paper';

// 时间格式化函数
const printTime = (timestamp) => {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
};

const HistoryPage = () => {
    const [historyData, setHistoryData] = useState({ text: [], image: [] });
    const [selectedTab, setSelectedTab] = useState('text');
    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 读取文本检测历史数据
                const textFileUri = FileSystem.documentDirectory + 'textHistory.json';
                const textFileInfo = await FileSystem.getInfoAsync(textFileUri);
                let textData = [];
                if (textFileInfo.exists) {
                    const textResponse = await FileSystem.readAsStringAsync(textFileUri);
                    textData = JSON.parse(textResponse);
                    // 格式化时间并整理数据
                    textData = textData.map(item => ({
                        ...item,
                        time: printTime(item.time)
                    }));
                }

                // 读取文本检测历史数据
                const videoFileUri = FileSystem.documentDirectory + 'videoHistory.json';
                const videoFileInfo = await FileSystem.getInfoAsync(videoFileUri);
                let videoData = [];
                if (videoFileInfo.exists) {
                    const videoResponse = await FileSystem.readAsStringAsync(videoFileUri);
                    videoData = JSON.parse(videoResponse);
                    // 格式化时间并整理数据
                    videoData = videoData.map(item => ({
                        ...item,
                        time: printTime(item.time)
                    }));
                }
                console.log("videoData: ",videoData);

                // 读取图片检测历史数据
                const imgFileUri = FileSystem.documentDirectory + 'imgHistory.json';
                const imgFileInfo = await FileSystem.getInfoAsync(imgFileUri);
                let imgData = [];
                if (imgFileInfo.exists) {
                    const imgResponse = await FileSystem.readAsStringAsync(imgFileUri);
                    imgData = JSON.parse(imgResponse);
                    // 格式化时间并整理数据
                    imgData = imgData.map(item => ({
                        ...item,
                        time: printTime(item.time)
                    }));
                }

                setHistoryData({ text: textData, image: imgData, video: videoData });
            } catch (error) {
                console.log('读取文件出错:', error);
            }
        };
        fetchData();
    }, []);

    return (
        <ImageBackground
            source={bgImage}
            style={styles.background}
        >
            <View style={styles.overlay}>
                
                <SegmentedButtons
                    value={selectedTab}
                    onValueChange={setSelectedTab}
                    theme={{ 
                        colors: {
                            secondaryContainer: 'rgba(41, 146, 232, 0.82)',
                            onSecondaryContainer: '#FFFFFF',
                            onSurface: '#FFFFFF',
                            primary: '#FFFFFF',
                            outline: 'rgba(161, 208, 246, 0.3)',
                        } 
                    }}
                    buttons={[
                        { value: 'text', label: '文本检测' },
                        { value: 'image', label: '图片检测'},
                        { value: 'video', label: '视频检测'}
                    ]}
                    style={styles.segmentedButtons}
                />
                
                <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                    {selectedTab === 'text' && (
                        <View>
                            {historyData.text.length === 0 ? (
                                <View style={styles.emptyState}>
                                    <MaterialCommunityIcons name="clipboard-text-clock" size={48} color="rgba(255, 255, 255, 0.4)" />
                                    <Text style={styles.emptyText}>暂无文本检测历史记录</Text>
                                </View>
                            ) : (
                                historyData.text.map((item, index) => (
                                    <Pressable
                                        key={item.index}
                                        onPress={() => {
                                            router.push({
                                                pathname: 'result',
                                                params: {
                                                    index: item.index,
                                                    percentage: item.percentage,
                                                    textSegments: JSON.stringify(item.textSegments),
                                                    newflag: 0,
                                                    radarValues: JSON.stringify(item.radarValues),
                                                }
                                            });
                                        }}
                                        style={({ pressed }) => [
                                            styles.historyCard,
                                            pressed && styles.cardPressed
                                        ]}
                                    >
                                        <View style={styles.cardContent}>
                                            <View style={styles.cardIcon}>
                                                <MaterialCommunityIcons name="clipboard-text-clock" size={28} color="#40A9FF" />
                                            </View>
                                            <View style={styles.cardDetails}>
                                                <Text style={styles.cardTitle}>{`检测记录 #${item.index}`}</Text>
                                                <Text style={styles.cardDescription} numberOfLines={2}>
                                                    {item.textSegments[0]?.content || '无内容'}
                                                </Text>
                                                <View style={styles.cardFooter}>
                                                    <View style={styles.tagContainer}>
                                                        <Text style={styles.tagText}>文本检测</Text>
                                                    </View>
                                                    <Text style={styles.cardTime}>{item.time}</Text>
                                                </View>
                                            </View>
                                        </View>
                                    </Pressable>
                                ))
                            )}
                        </View>
                    )}

                    {selectedTab === 'video' && (
                        <View>
                            {historyData.video.length === 0 ? (
                                <View style={styles.emptyState}>
                                    <MaterialCommunityIcons name="clipboard-text-clock" size={48} color="rgba(255, 255, 255, 0.4)" />
                                    <Text style={styles.emptyText}>暂无视频检测历史记录</Text>
                                </View>
                            ) : (
                                historyData.video.map((item, index) => (
                                    <Pressable
                                        key={item.index}
                                        onPress={() => {
                                            router.push({
                                                pathname: 'videoResult',
                                                params: {
                                                    index: item.index,
                                                    percentage: item.percentage,
                                                    videoUri: item.uri,
                                                    videoLink: item.link,
                                                    newflag: 0,
                                                }
                                            });
                                        }}
                                        style={({ pressed }) => [
                                            styles.historyCard,
                                            pressed && styles.cardPressed
                                        ]}
                                    >
                                        <View style={styles.cardContent}>
                                            <View style={styles.cardIcon}>
                                                {/* <MaterialCommunityIcons name="clipboard-text-clock" size={28} color="#40A9FF" /> */}
                                                <FontAwesome6 name="file-video" size={28} color="#40A9FF" />
                                            </View>
                                            <View style={styles.cardDetails}>
                                                <Text style={styles.cardTitle}>{`检测记录 #${item.index}`}</Text>
                                                <Text style={styles.cardDescription} numberOfLines={2}>
                                                    {item.uri.split('/').pop() || item.link || '无文件名'}
                                                </Text>
                                                <View style={styles.cardFooter}>
                                                    <View style={styles.tagContainer}>
                                                        <Text style={styles.tagText}>视频检测</Text>
                                                    </View>
                                                    <Text style={styles.cardTime}>{item.time}</Text>
                                                </View>
                                            </View>
                                        </View>
                                    </Pressable>
                                ))
                            )}
                        </View>
                    )}
                    
                    {selectedTab === 'image' && (
                        <View>
                            {historyData.image.length === 0 ? (
                                <View style={styles.emptyState}>
                                    <MaterialCommunityIcons name="image-clock" size={48} color="rgba(255, 255, 255, 0.4)" />
                                    <Text style={styles.emptyText}>暂无图片检测历史记录</Text>
                                </View>
                            ) : (
                                historyData.image.map((item, index) => (
                                    <Pressable
                                        key={item.index}
                                        onPress={() => {
                                            router.push({
                                                pathname: 'imgResult',
                                                params: {
                                                    index: item.index,
                                                    percentage: item.percentage,
                                                    imgUri: item.uri,
                                                    newflag: 0,
                                                }
                                            });
                                        }}
                                        style={({ pressed }) => [
                                            styles.historyCard,
                                            pressed && styles.cardPressed
                                        ]}
                                    >
                                        <View style={styles.cardContent}>
                                            <View style={styles.cardImageContainer}>
                                                <Image
                                                    source={{ uri: item.uri }}
                                                    style={styles.cardImage}
                                                    contentFit="cover"
                                                />
                                            </View>
                                            <View style={styles.cardDetails}>
                                                <Text style={styles.cardTitle}>{`检测记录 #${item.index}`}</Text>
                                                <Text style={styles.cardDescription} numberOfLines={2}>
                                                    {item.uri.split('/').pop() || '无文件名'}
                                                </Text>
                                                <View style={styles.cardFooter}>
                                                    <View style={styles.tagContainer}>
                                                        <Text style={styles.tagText}>图片检测</Text>
                                                    </View>
                                                    <Text style={styles.cardTime}>{item.time}</Text>
                                                </View>
                                            </View>
                                        </View>
                                    </Pressable>
                                ))
                            )}
                        </View>
                    )}
                </ScrollView>
            </View>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    background: {
        flex: 1,
        resizeMode: 'cover',
    },
    overlay: {
        flex: 1,
    },
    segmentedButtons: {
        margin: 16,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 60,
    },
    historyCard: {
        backgroundColor: 'rgba(80, 77, 77, 0.58)',
        borderRadius: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 5,
        overflow: 'hidden',
        transitionDuration: '0.2s',
        borderWidth: 1,
        borderColor: 'rgba(136, 130, 130, 0.15)',
    },
    cardPressed: {
        transform: [{ scale: 0.98 }],
        opacity: 0.9,
        backgroundColor: 'rgba(255, 255, 255, 0.12)',
    },
    cardContent: {
        flexDirection: 'row',
        padding: 16,
    },
    cardIcon: {
        width: 56,
        height: 56,
        borderRadius: 14,
        backgroundColor: 'rgba(64, 169, 255, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
        borderWidth: 1,
        borderColor: 'rgba(64, 169, 255, 0.3)',
    },
    cardImageContainer: {
        width: 56,
        height: 56,
        borderRadius: 14,
        overflow: 'hidden',
        marginRight: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    cardImage: {
        width: '100%',
        height: '100%',
    },
    cardDetails: {
        flex: 1,
        justifyContent: 'space-between',
    },
    cardTitle: {
        fontSize: 17,
        fontWeight: '600',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    cardDescription: {
        fontSize: 15,
        color: 'rgba(255, 255, 255, 0.7)',
        marginBottom: 8,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    tagContainer: {
        backgroundColor: 'rgba(64, 169, 255, 0.2)',
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 12,
    },
    tagText: {
        fontSize: 13,
        color: '#40A9FF',
        fontWeight: '500',
    },
    cardTime: {
        fontSize: 13,
        color: 'rgba(255, 255, 255, 0.5)',
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderRadius: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 5,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.15)',
    },
    emptyText: {
        marginTop: 16,
        fontSize: 17,
        color: 'rgba(255, 255, 255, 0.4)',
        textAlign: 'center',
    }
});

export default HistoryPage;
