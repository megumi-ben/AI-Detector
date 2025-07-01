import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import FormData from 'form-data';

const detectImage = async (mediaUri) => {
    try {
        console.log("执行",detectImage,",ImgUrl:",mediaUri);
        const data = new FormData();
        const fileInfo = await FileSystem.getInfoAsync(mediaUri);
        if (!fileInfo.exists) {
            throw new Error('文件不存在');
        }
        console.log("执行执行2");
        data.append('media', {
            uri: mediaUri,
            type: 'image/jpeg', // 根据实际文件类型设置
            name: 'ai.jpg', // 文件名
        });

        data.append('models', 'deepfake');
        data.append('api_user', '1513887031');
        data.append('api_secret', '9hF9QbZLNLgtqQ6m3HupfttnaYMrRxAm');
        const response = await axios({
            method: 'post',
            url: 'https://api.sightengine.com/1.0/check.json',
            data: data,
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            // headers: data.getHeaders()
            // timeout: 10000 // 设置超时时间为 10 秒
        });
        console.log(response.data);
        console.log("deepfake几率：",response.data.type.deepfake);
        return response.data.type.deepfake;
    } catch (error) {
        if (error.response) {
            console.log(error.response.data);
        } else {
            console.log(error.message);
        }
        throw error;
    }
};
const detectText=async (text) => {
  // const options = {
  //   method: 'POST',
  //   url: 'https://ai-detection4.p.rapidapi.com/v1/ai-detection-rapid-api',
  //   headers: {
  //     'x-rapidapi-key': '233ac3bb36mshcc33feefaa6dba5p1df36cjsn5ccbf45c3865',
  //     'x-rapidapi-host': 'ai-detection4.p.rapidapi.com',
  //     'Content-Type': 'application/json'
  //   },
  //   data: {
  //     text
  //   }
  // };
  const options = {
    method:"POST",
    url:'https://aidetect.lab.westlake.edu.cn/api/detect',
    data:{
      detector: "fast-detect(falcon-7b/falcon-7b-instruct)",
      text: text,
    },
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer sk-7f6eb4c8fbeecb5e171372b8c0fd2254'
    },
  }
  console.log("执行detectText，text:",text);
  console.log("参数text",text);
  try {
    const response = await axios.request(options);
    console.log("response.data:",response.data);
    return response.data;
  } catch (error) {
    console.error("AI内容检测API错误:", error);
    throw error; // 将错误抛出，让调用者处理
  }
}
const detectVideo = async (mediaUri,interval=2) => {
    try {
        console.log("执行",detectImage,",ImgUrl:",mediaUri);
        const data = new FormData();
        const fileInfo = await FileSystem.getInfoAsync(mediaUri);
        if (!fileInfo.exists) {
            throw new Error('文件不存在');
        }
        console.log("执行执行2");
        data.append('media', {
            uri: mediaUri,
            type: 'video/mp4', // 根据实际文件类型设置
            name: 'ai.mp4', // 文件名
        });

        data.append('models', 'deepfake');
        data.append('api_user', '1513887031');
        data.append('api_secret', '9hF9QbZLNLgtqQ6m3HupfttnaYMrRxAm');
        data.append('interval',interval);
        const response = await axios({
            method: 'post',
            url: 'https://api.sightengine.com/1.0/video/check-sync.json',
            data: data,
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            // headers: data.getHeaders()
            // timeout: 10000 // 设置超时时间为 10 秒
        });
        console.log(response.data);
        console.log("deepfake几率：",response.data.data.frames[0].type.deepfake);
        let sum=0;
        for(const frame of response.data.data.frames){
            console.log("帧概率：",frame.type.deepfake);
            sum+=frame.type.deepfake;
        }
        const aver=sum/response.data.data.frames.length;
        console.log("平均概率：",aver);
        return aver;
    } catch (error) {
        if (error.response) {
            console.log(error.response.data);
        } else {
            console.log(error.message);
        }
        throw error;
    }
};
const handleStringData=(rawData)=>{
    // 分割每段事件块
    const events = rawData.split('\n\n');

    let avgScore = null;

    for (const event of events) {
    const lines = event.split('\n');
    let eventType = '';
    let dataStr = '';

    for (const line of lines) {
        if (line.startsWith('event:')) {
        eventType = line.slice(6).trim();
        } else if (line.startsWith('data:')) {
        dataStr += line.slice(5).trim(); // 去掉 "data:" 前缀
        }
    }

    if (eventType === 'done') {
        try {
        const parsed = JSON.parse(dataStr);
        avgScore = parsed.avg_score;
        break; // 找到就退出
        } catch (e) {
        console.error('JSON解析失败:', e);
        }
    }
    }

    console.log('avg_score:', avgScore);
    return avgScore;
}
const detectVideoByHttp = async (url)=>{
    try{
        const res=await axios({
            method: "POST",
            url: "http://103.185.248.72:5000/video",
            data: {
                url: url,
            },
            headers: {
                'Content-Type': 'application/json'
            }
        });
        console.log(res.data);
        console.log(typeof res.data);
        let score=handleStringData(res.data);
        console.log("ssscore: ",score);
        return score;
    }catch (error){
        if (error.response) {
            console.log(error.response.data);
        } else {
            console.log(error.message);
        }
        throw error;
    }
}


export { detectImage, detectText, detectVideo, detectVideoByHttp };

