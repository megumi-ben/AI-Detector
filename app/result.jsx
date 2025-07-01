import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
// 导入 PieCharter 组件
import GuageCharter from "@/components/GuageCharter";
import NightingaleCharter from "@/components/NightingaleCharter";
import PieCharter from '@/components/PieCharter';
import TextShow from "@/components/TextShow";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as FileSystem from 'expo-file-system';
import LottieView from 'lottie-react-native';
import { Card } from 'react-native-paper';
// 导入 getResponse 函数，需根据实际路径调整
import RadarCharter from "@/components/RadarCharter";
import { detectText } from '@/utils/api';
import { deleteFile, removeRecordByIndex } from "@/utils/editFile";
import { getResponse } from '@/utils/llm';

const getTextColor = (percentage) => {
    if (percentage < 30) {
        return 'green';
    } else if (percentage >= 30 && percentage < 60) {
        return '#1E90FF';
    } else if (percentage >= 60 && percentage < 80) {
        return '#FFA500';
    } else {
        return'red';
    }
};

const printTime=(timestamp) => {
    // 创建一个 Date 对象
    const date = new Date(timestamp);
    // 获取年、月、日、小时、分钟
    const year = date.getFullYear();
    // 月份从 0 开始，所以要加 1
    const month = String(date.getMonth() + 1).padStart(2, '0'); 
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    // 拼接成需要的格式
    const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}`;
    console.log(formattedDate);
}

const ResultPage = () => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [textSegments, setTextSegments] = useState([]); // 初始化 textSegments 状态
    const searchParams = useLocalSearchParams();
    const [percentage,setPercentage]=useState(50);
    const [userInput,setUserInput] = useState(searchParams.inputText || '');
    const [radarValues,setRadarValues] = useState([100,100,100]);
    // const userInput = searchParams.inputText || ''; // 获取 userInput 参数
    const newflag = searchParams.newflag? parseInt(searchParams.newflag) : 0; // 获取newflag参数，默认为0
    const nowIndex = searchParams.index? parseInt(searchParams.index) : 0;
    let textSegments0;
    if(searchParams.textSegments) {
        textSegments0 = JSON.parse(searchParams.textSegments);
    } else{
        textSegments0 =  [
            { content: "在中国“嫦娥一号”探月卫星于明年发射之后,中国还将发射三颗“夸父”卫星“逐日”。", type: 0 },
            { content: "昨天,在第36届世界空间科学大会各国航天局圆桌会议上,中国国家航天局局长孙来燕讲解了中国未来五年航天计划,其中未来五年中国将为发射“夸父”卫星进行日地空间探测进行前期准备。", type: 1 },
            { content: "孙来燕说，目前正在对“夸父计划”进行可行性研究，未来五年当中，将完成发射的前期准备工作。", type: 2 },
            { content: "据悉,“夸父计划——空间风暴、极光和空间天气探测计划”是由北京大学地球与空间科学学院涂传诒院士等人提出的。“夸父计划”将由一颗位于日地系统第一拉格朗日点(L1点)的卫星“夸父A”和两颗沿极轨共轭飞行的卫星“夸父B1”、“夸父B2”组成综合观测系统,将用于监测太阳活动导致的日地空间环境连锁变化的全过程。", type: 1 },
            { content: "“夸父A”卫星的任务是飞行到日地连线上的L1点、即距地球150万公里处进行探测,用来全天候监测太阳爆发事件的发生及其扰动在日地空间中的传播过程。", type: 0 },
            { content: "由于该点具有观测太阳活动的天然优势,因此,“夸父A”选择L1点附近作为目标飞行位置,另外目前,只有美国航空航天局和欧洲空间局有为数不多的航天器,到达过L1点。", type: 1 },
            { content: "而“夸父B”两颗卫星的飞行任务是实现一天24小时,一周7天连续观测北极光的分布,用来监测太阳活动导致的地球附近空间环境的整体变化。", type: 2 },
        ];
    }
    console.log("newflag:",newflag);
    console.log('接收到的参数:', userInput);

    let resultText, iconName, iconStyle, cardStyle;
    if (percentage >= 0 && percentage <= 30) {
        resultText = '不太可能是AI生成';
        iconName = 'check-circle';
        iconStyle = styles.checkIcon;
        cardStyle = styles.unlikelyAi;
    } else if (percentage >= 31 && percentage <= 70) {
        resultText = '存在AI生成可能';
        iconName = 'warning';
        iconStyle = styles.warningIcon;
        cardStyle = styles.possibleAi;
    } else {
        resultText = '极大概率是AI生成';
        iconName = 'cancel';
        iconStyle = styles.crossIcon;
        cardStyle = styles.highlyLikelyAi;
    }

    const getRandomValuesForRadar = () => {
        let a=100,b=100,c=100;
        let add=100;
        if(percentage<10){
            add=100
        }else if(percentage<30){
            add=150;
        }else if(percentage<50){
            add=200;
        }else if(percentage<80){
            add=250;
        }else{
            add=400;
        }
        a+=Math.floor(Math.random()*add);
        b+=Math.floor(Math.random()*add);
        c+=Math.floor(Math.random()*add);
        setRadarValues([a,b,c]);
        console.log("setRadarValues: ",[a,b,c]);
    }

    useEffect(() => {
        if (newflag === 1) {
            setIsLoading(true);
            // 调用 getResponse 函数
            console.log("userInput:",userInput);
            getResponse(userInput)
              .then(response => {
                    try {
                        const data = JSON.parse(response);
                        setTextSegments(data.messages);
                        setIsLoading(false);
                    } catch (error) {
                        console.error('解析 JSON 出错:', error);
                        setIsLoading(false);
                    }
                })
              .catch(error => {
                    console.error('获取响应出错:', error);
                    setIsLoading(false);
                });
            detectText(userInput)
              .then(response => {
                    try {
                        // const data = JSON.parse(response);
                        console.log("detectText-data:",response);
                        setPercentage(parseFloat(response.data.prob).toFixed(4)*100);
                        setIsLoading(false);
                    } catch (error) {
                        console.error('解析 JSON 出错:', error);
                        setIsLoading(false);
                    }
                })
              .catch(error => {
                    console.error('获取响应出错:', error);
                    setIsLoading(false);
                });
            getRandomValuesForRadar();

        } else {
            setTextSegments(textSegments0);
            setIsLoading(false);
        }
        if(searchParams.percentage){
            setPercentage(parseFloat(searchParams.percentage));
        }
        if(searchParams.radarValues){
            console.log("searchParams.radarValues存在",JSON.parse(searchParams.radarValues));
            setRadarValues(JSON.parse(searchParams.radarValues));
        }
    }, [newflag, userInput]); // 依赖项添加 userInput

    const saveToLocal = async () => {
        try {
            const fileUri = FileSystem.documentDirectory + 'textHistory.json';
            console.log("存储文件路径：", fileUri);
            // 读取原有文件内容
            let existingData = [];
            const fileInfo = await FileSystem.getInfoAsync(fileUri);
            if (fileInfo.exists) {
                const response = await FileSystem.readAsStringAsync(fileUri);
                existingData = JSON.parse(response);
            }
            // 获取当前时间戳作为时间信息
            const currentTime = new Date().getTime();
            printTime(currentTime);
            // 生成唯一的index，这里简单以现有数据长度作为index
            // const newIndex = existingData.length;
            const newIndex = currentTime;
            // 添加新数据
            const newData = { percentage, textSegments, index: newIndex, time: currentTime, radarValues: radarValues };
            existingData.push(newData);
            // 写入更新后的数据
            await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(existingData));
            console.log("读取文件数据：", JSON.stringify(existingData));
            console.log('保存成功');
            Alert.alert('提示', '保存成功');
        } catch (error) {
            console.log('保存失败:', error);
        }
    };

    const deleteRecord = () => {
        removeRecordByIndex(nowIndex,'textHistory.json');
        router.back();
    }

    return (
        <View style={styles.container}>
            {newflag === 1 && isLoading? (
                <View style={styles.overlay}>
                    <LottieView
                        source={require('@/assets/Animation.json')}
                        autoPlay
                        loop
                        style={styles.animation}
                    />
                </View>
            ) : (
                <ScrollView>
                    <Card style={[styles.aiResultCard, cardStyle]}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <MaterialIcons name={iconName} size={24} style={iconStyle} />
                            <Text style={[styles.aiResultText, { color: iconStyle.color }]}>
                                {resultText}
                            </Text>
                        </View>
                    </Card>
                    {/* <Card style={styles.card}>
                        <Card.Content>
                            <View style={styles.pieAndTextContainer}>
                                <View style={styles.textContainer}>
                                    <Text style={styles.title}>AI生成内容占比</Text>
                                    <Text style={[styles.percentageText, { color: getTextColor(percentage) }]}>
                                        {percentage}%
                                    </Text>
                                </View>
                                <View style={styles.pieChart}>
                                    <PieCharter />
                                </View>
                            </View>
                        </Card.Content>
                    </Card> */}
                    <Card style={styles.card}>
                        <Card.Content>
                            <View style={[styles.guageChart]}>
                                <Text style={styles.guageTitle}>使用AIGC的概率：</Text>
                                <GuageCharter possibility={percentage}/>
                            </View>
                        </Card.Content>
                    </Card>
                    {/* <Card style={styles.card}>
                        <Card.Content>
                            <View>
                                <Text style={styles.guageTitle}>来自各模型概率：</Text>
                                <NightingaleCharter />
                            </View>
                        </Card.Content>
                    </Card> */}
                    <Card style={styles.radarCard}>
                        <Card.Content>
                            <View>
                                <Text style={styles.guageTitle}>特征图：</Text>
                                <RadarCharter values={radarValues}/>
                            </View>
                        </Card.Content>
                    </Card>
                    <Card style={styles.textCard}>
                        <Card.Content>
                            <TextShow messages={textSegments} />
                        </Card.Content>
                    </Card>
                    {newflag === 1 && (
                        <TouchableOpacity style={styles.saveButton} onPress={saveToLocal}>
                            <Text style={styles.buttonText}>保存</Text>
                        </TouchableOpacity>
                    )}
                    {newflag === 0 && (
                        <TouchableOpacity style={styles.deleteButton} onPress={deleteRecord}>
                            <Text style={styles.buttonText}>删除当前记录</Text>
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity style={styles.deleteButton} onPress={()=>deleteFile('textHistory.json')}>
                        <Text style={styles.buttonText}>删除文件</Text>
                    </TouchableOpacity>
                </ScrollView>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingHorizontal: 0,
        paddingTop: 1,
        backgroundColor: 'rgba(86, 84, 84, 0.5)',
    },
    card: {
        width: '98%',
        height: 350,
        marginBottom: 10,
        opacity: 0.95,
    },
    radarCard: {
        width: '98%',
        // height: 450,
        marginBottom: 10,
    },
    textCard: {
        width: '98%',
        marginBottom: 10,
    },
    pieAndTextContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    textContainer: {
        marginTop: -60,
    },
    pieChart: {
        flex: 1,
        height: 260,
        alignItems: 'center',
    },
    guageChart: {
        width: '100%',
        height: 300,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5
    },
    guageTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10
    },
    percentageText: {
        fontSize: 36,
        fontWeight: 'bold',
        marginBottom: 10
    },
    aiResultCard: {
        width: '98%',
        height: 80,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    aiResultText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    unlikelyAi: {
        backgroundColor: '#E5FFE5',
    },
    possibleAi: {
        backgroundColor: '#FFF0CC',
    },
    highlyLikelyAi: {
        backgroundColor: '#FFE5E5',
    },
    checkIcon: {
        fontSize: 24,
        color: 'green',
        marginRight: 5,
    },
    warningIcon: {
        fontSize: 24,
        color: '#FF8C00',
        marginRight: 5,
    },
    crossIcon: {
        fontSize: 24,
        color:'red',
        marginRight: 5,
    },
    animation: {
        width: 200,
        height: 200,
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    saveButton: {
        backgroundColor: '#2196F3', // 蓝色调
        borderRadius: 8,
        paddingVertical: 16,
        paddingHorizontal: 32,
        marginTop: 10,
        marginHorizontal: 20,
        alignItems: 'center',
        justifyContent: 'center'
    },
    deleteButton: {
        backgroundColor: '#FF5252', // 主红色
        borderRadius: 24, // 更大圆角提升柔和感
        paddingVertical: 14, // 优化垂直内边距
        paddingHorizontal: 24, // 优化水平内边距
        marginTop: 12, // 调整上边距
        marginHorizontal: 16, // 调整水平边距
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 4, // 增加阴影深度
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        overflow: 'hidden', // 确保边框圆角生效
        borderWidth: 1, // 添加细微边框
        borderColor: 'rgba(255,255,255,0.1)', // 半透明白色边框
        backgroundColor: '#FF4D4F', // 更饱和的红色
        transform: [{ scale: 1 }], // 初始状态
        transitionDuration: '200ms', // 动画过渡
        marginBottom: 10
    },
    buttonText: {
        color: 'white',
        fontSize: 16, // 增大字体
        fontWeight: '600', // 半粗体
        letterSpacing: 0.5, // 增加字间距
        textShadowColor: 'rgba(0,0,0,0.2)', // 轻微文本阴影
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 1,
    },
});

export default ResultPage;