import * as FileSystem from 'expo-file-system';

const removeRecordByIndex = async (targetIndex,fileName) => {
    try {
        const fileUri = FileSystem.documentDirectory + fileName;
        const fileInfo = await FileSystem.getInfoAsync(fileUri);

        if (fileInfo.exists) {
            const response = await FileSystem.readAsStringAsync(fileUri);
            let existingData = JSON.parse(response);

            // 过滤掉 index 属性值等于 targetIndex 的元素
            existingData = existingData.filter(item => item.index!== targetIndex);

            // 将更新后的数据写回文件
            await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(existingData));
            console.log('记录删除成功');
        } else {
            console.log('文件不存在');
        }
    } catch (error) {
        console.log('删除记录时出错:', error);
    }
};
const deleteFile = async (fileName) => {
    try {
        const fileUri = FileSystem.documentDirectory + fileName;
        const fileInfo = await FileSystem.getInfoAsync(fileUri);
        if (fileInfo.exists) {
            await FileSystem.deleteAsync(fileUri);
            console.log('文件删除成功');
        } else {
            console.log('文件不存在');
        }
    } catch (error) {
        console.log('删除文件时出错:', error);
    }
};
const deleteFileByPath = async (fileUri) => {
    try {
        const fileInfo = await FileSystem.getInfoAsync(fileUri);
        if (fileInfo.exists) {
            await FileSystem.deleteAsync(fileUri);
            console.log('文件删除成功');
        } else {
            console.log('文件不存在');
        }
    } catch (error) {
        console.log('删除文件时出错:', error);
    }
};
const saveToLocal = async (percentage, textSegments,fileName) => {
    try {
        const fileUri = FileSystem.documentDirectory + fileName;
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
        // printTime(currentTime);
        // 生成唯一的index，这里简单以现有数据长度作为index
        // const newIndex = existingData.length;
        const newIndex = currentTime;
        // 添加新数据
        const newData = { percentage, textSegments, index: newIndex, time: currentTime };
        existingData.push(newData);
        // 写入更新后的数据
        await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(existingData));
        console.log("读取文件数据：", JSON.stringify(existingData));
        console.log('保存成功');
        // Alert.alert('提示', '保存成功');
    } catch (error) {
        console.log('保存失败:', error);
    }
};
const listFile = async () => {
    try {
        const files = await FileSystem.readDirectoryAsync(FileSystem.documentDirectory);
        return files;
    } catch (error) {
        console.error('读取文件目录时出错:', error);
        return [];
    }
};
export {removeRecordByIndex,deleteFile,saveToLocal,listFile,deleteFileByPath};