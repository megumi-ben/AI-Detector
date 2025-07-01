import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { listFile, saveToLocal } from '@/utils/editFile';

const FileListPage = () => {
    const [fileList, setFileList] = useState([]);

    const handleListFiles = async () => {
        const files = await listFile();
        setFileList(files);
    };
    const textSegmentsString=`
    [{"content":"随着 5G 网络的全面覆盖，智能交通系统迎来了全新的发展机遇。","type":0},
{"content":"在城市交通管理方面，5G 技术助力实现了交通信号灯的智能调控。通过实时收集道路上的车流量信息，信号灯能动态调整绿灯时长，大大缓解了拥堵状况。比如在一些大城市的繁忙路口，应用该技术后，车辆平均等待时间缩短了约 30%。","type":1},
{"content":"对于自动驾驶领域，5G 的低时延特性至关重要。它使得车辆与车辆（V2V）、车辆与基础设施（V2I）之间能够快速、稳定地通信。这意味着自动驾驶汽车能更及时地获取周围环境信息，做出精准决策，从而显著提升驾驶安全性。","type":0},
{"content":"物流运输行业也因 5G 技术发生了变革。无人机配送借助 5G 网络实现了更精准的定位和更高效的路径规划。在一些偏远地区，无人机可以快速将物资送达，解决了传统配送方式耗时久的问题，为紧急救援等场景提供了有力支持。","type":1},
{"content":"不过，5G 技术在智能交通应用中也存在一些问题。一方面，5G 基站建设成本高昂，在一些经济欠发达地区，全面覆盖 5G 网络面临资金压力，这限制了智能交通系统的推广速度。","type":2},
{"content":"另一方面，5G 网络的安全性面临挑战。智能交通系统高度依赖网络通信，一旦遭受黑客攻击，可能导致交通瘫痪，引发严重的安全事故。目前，相关的网络安全防护技术还需要进一步完善。","type":1},
{"content":"此外，不同设备和系统之间的兼容性也是一个难题。由于智能交通涉及众多不同品牌和类型的设备，它们之间的通信协议和接口标准尚未统一，这给系统的集成和协同工作带来了困难。","type":2},
{"content":"尽管存在这些挑战，但 5G 技术推动智能交通发展的趋势不可阻挡。随着技术的持续创新和行业标准的逐步完善，5G 将在智能交通领域释放更大的潜力，为人们打造更加便捷、高效、安全的出行环境。","type":1}]
    `;
    const addRecord=async () => {
        saveToLocal(86,JSON.parse(textSegmentsString),'textHistory.json')
        Alert.alert("添加成功！");
    };
    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.button} onPress={handleListFiles}>
                <Text style={styles.buttonText}>列出文件</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={addRecord}>
                <Text style={styles.buttonText}>添加记录</Text>
            </TouchableOpacity>
            <ScrollView style={styles.fileListContainer}>
                {fileList.map((file, index) => (
                    <Text key={index} style={styles.fileItem}>
                        {file}
                    </Text>
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    button: {
        backgroundColor: '#2196F3',
        borderRadius: 8,
        paddingVertical: 16,
        paddingHorizontal: 32,
        marginTop: 20,
        marginBottom: 20,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    fileListContainer: {
        width: '100%',
    },
    fileItem: {
        fontSize: 16,
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
});

export default FileListPage;