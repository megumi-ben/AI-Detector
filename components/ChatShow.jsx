// components/ChatShow.jsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image} from 'expo-image';
import Markdown from 'react-native-markdown-display';

const ChatShow = ({ messages }) => {
    return (
        <View>
            {messages.map((message, index) => (
                <View key={index} style={message.role === 'assistant' ? styles.assistantMessageContainer : styles.userMessageContainer}>
                    <Image
                        source={message.role === 'assistant' ? require('@/assets/images/assistant.jpg') : require('@/assets/images/user.jpg')}
                        style={styles.avatar}
                    />
                    <View style={message.role === 'assistant' ? styles.assistantMessageBubble : styles.userMessageBubble}>
                        <Markdown style={styles.messageText}>
                            {message.content}
                        </Markdown>
                    </View>
                </View>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    assistantMessageContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start', // 修改为 flex-start 让头像和消息框顶部对齐
        marginBottom: 10,
    },
    userMessageContainer: {
        flexDirection: 'row-reverse',
        alignItems: 'flex-start', // 修改为 flex-start 让头像和消息框顶部对齐
        marginBottom: 10,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 10,
        marginLeft: 10,
    },
    assistantMessageBubble: {
        backgroundColor: '#f0f0f0',
        padding: 10,
        borderRadius: 10,
        // 新增样式：限制最大宽度为屏幕宽度的 70%，自动换行
        maxWidth: '70%',
        flexWrap: 'wrap',
    },
    userMessageBubble: {
        backgroundColor: '#007aff',
        padding: 10,
        borderRadius: 10,
        color: 'white',
        // 新增样式：限制最大宽度为屏幕宽度的 70%，自动换行
        maxWidth: '70%',
        flexWrap: 'wrap',
    },
    messageText: {
        maxWidth: '100%', // 确保文本不超出消息框宽度
        flexWrap: 'wrap', // 允许文本换行
        wordBreak: 'break-word', // 强制长单词换行（可选）
    },
});

export default ChatShow;