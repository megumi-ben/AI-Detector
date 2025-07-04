import OpenAI from "openai";

const openai = new OpenAI({
    baseURL: 'https://api.deepseek.com',
    apiKey: 'sk-82a35f61beef421e9b15de87771755c4'
});

const getResponse=async (userInput)=> {
    const system_prompt = `
        你的任务是帮助用户鉴别输入文本内容是否是ai生成的。输出格式是JSON格式，含有"messages"属性，messages是一个数组，内部的json格式为\\{content\\:string,type\\:int,\\}。
        其中type为0表示认为该段不是ai生成的，type为1表示该段有可能是ai生成，type为2表示该段文本极大概率是ai生成。
        用户输入的是一整段文本，而你需要对文本进行分段地分析。

        示例 INPUT: 
        在中国“嫦娥一号”探月卫星于明年发射之后,中国还将发射三颗“夸父”卫星“逐日”。昨天,在第36届世界空间科学大会各国航天局圆桌会议上,中国国家航天局局长孙来燕讲解了中国未来五年航天计划,其中未来五年中国将为发射“夸父”卫星进行日地空间探测进行前期准备。
        孙来燕说，目前正在对“夸父计划”进行可行性研究，未来五年当中，将完成发射的前期准备工作。据悉,“夸父计划——空间风暴、极光和空间天气探测计划”是由北京大学地球与空间科学学院涂传诒院士等人提出的。“夸父计划”将由一颗位于日地系统第一拉格朗日点(L1点)的卫星“夸父A”和两颗沿极轨共轭飞行的卫星“夸父B1”、“夸父B2”组成综合观测系统,将用于监测太阳活动导致的日地空间环境连锁变化的全过程。
        “夸父A”卫星的任务是飞行到日地连线上的L1点、即距地球150万公里处进行探测,用来全天候监测太阳爆发事件的发生及其扰动在日地空间中的传播过程。由于该点具有观测太阳活动的天然优势,因此,“夸父A”选择L1点附近作为目标飞行位置,另外目前,只有美国航空航天局和欧洲空间局有为数不多的航天器,到达过L1点。而“夸父B”两颗卫星的飞行任务是实现一天24小时,一周7天连续观测北极光的分布,用来监测太阳活动导致的地球附近空间环境的整体变化。

        示例 JSON OUTPUT:
        {
            "messages": [
                { content: "在中国“嫦娥一号”探月卫星于明年发射之后,中国还将发射三颗“夸父”卫星“逐日”。",type:0},
                { content: "昨天,在第36届世界空间科学大会各国航天局圆桌会议上,中国国家航天局局长孙来燕讲解了中国未来五年航天计划,其中未来五年中国将为发射“夸父”卫星进行日地空间探测进行前期准备。",type:1},
                { content: "孙来燕说，目前正在对“夸父计划”进行可行性研究，未来五年当中，将完成发射的前期准备工作。", type: 2 },
                { content: "据悉,“夸父计划——空间风暴、极光和空间天气探测计划”是由北京大学地球与空间科学学院涂传诒院士等人提出的。“夸父计划”将由一颗位于日地系统第一拉格朗日点(L1点)的卫星“夸父A”和两颗沿极轨共轭飞行的卫星“夸父B1”、“夸父B2”组成综合观测系统,将用于监测太阳活动导致的日地空间环境连锁变化的全过程。", type: 1 },
                { content: "“夸父A”卫星的任务是飞行到日地连线上的L1点、即距地球150万公里处进行探测,用来全天候监测太阳爆发事件的发生及其扰动在日地空间中的传播过程。", type: 0 },
                { content: "由于该点具有观测太阳活动的天然优势,因此,“夸父A”选择L1点附近作为目标飞行位置,另外目前,只有美国航空航天局和欧洲空间局有为数不多的航天器,到达过L1点。", type: 1 },
                { content: "而“夸父B”两颗卫星的飞行任务是实现一天24小时,一周7天连续观测北极光的分布,用来监测太阳活动导致的地球附近空间环境的整体变化。", type: 2 },
            ],
        }
    `
    let messages = [
        { role: "system", content: system_prompt },
    ];

    messages.push({ role: "user", content: userInput });

    const completion = await openai.chat.completions.create({
        messages: messages,
        model: "deepseek-chat",
        stream:false,
        response_format:{
            'type': 'json_object'
        },
    });

    const response = completion.choices[0].message.content;
    console.log(`助手：${response}`);
    return response;
}
export {getResponse};
// const input=`在中国“嫦娥一号”探月卫星于明年发射之后,中国还将发射三颗“夸父”卫星“逐日”。昨天,在第36届世界空间科学大会各国航天局圆桌会议上,中国国家航天局局长孙来燕讲解了中国未来五年航天计划,其中未来五年中国将为发射“夸父”卫星进行日地空间探测进行前期准备。
//         孙来燕说，目前正在对“夸父计划”进行可行性研究，未来五年当中，将完成发射的前期准备工作。据悉,“夸父计划——空间风暴、极光和空间天气探测计划”是由北京大学地球与空间科学学院涂传诒院士等人提出的。“夸父计划”将由一颗位于日地系统第一拉格朗日点(L1点)的卫星“夸父A”和两颗沿极轨共轭飞行的卫星“夸父B1”、“夸父B2”组成综合观测系统,将用于监测太阳活动导致的日地空间环境连锁变化的全过程。
//         “夸父A”卫星的任务是飞行到日地连线上的L1点、即距地球150万公里处进行探测,用来全天候监测太阳爆发事件的发生及其扰动在日地空间中的传播过程。由于该点具有观测太阳活动的天然优势,因此,“夸父A”选择L1点附近作为目标飞行位置,另外目前,只有美国航空航天局和欧洲空间局有为数不多的航天器,到达过L1点。而“夸父B”两颗卫星的飞行任务是实现一天24小时,一周7天连续观测北极光的分布,用来监测太阳活动导致的地球附近空间环境的整体变化。`;
// getResponse(input);