import React from'react';
import { Text, View, StyleSheet } from'react-native';

const getMessageColor = (type) => {
    switch (type) {
        case 0:
            return 'green';
        case 1:
            return '#FFA500';
        case 2:
            return'red';
        default:
            return 'black';
    }
};

const DetectionTextComponent = ({ messages }) => {
    return (
        <View>
            <Text style={styles.title}>检测片段详情</Text>
            <Text>
                {messages.map((message, index) => (
                    <Text key={index} style={{ color: getMessageColor(message.type) }}>
                        {message.content}
                    </Text>
                ))}
            </Text>
            
        </View>
    );
};

const styles = StyleSheet.create({
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5
    }
});

export default DetectionTextComponent;