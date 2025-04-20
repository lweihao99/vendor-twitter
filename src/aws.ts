import AWS from 'aws-sdk'
import dotenv from 'dotenv'
import { TweetFormatted } from './types/twitter';

dotenv.config()

AWS.config.update({region:process.env.AWS_REGION})

const marshall = AWS.DynamoDB.Converter.marshall;
const unmarshall = AWS.DynamoDB.Converter.unmarshall;

const { DynamoDB} = AWS;

const dynamodb = new DynamoDB();

// describe a table
export const dynamodbDescribeTable = async (tableName:string)=>{
  try {
    const table = await dynamodb.describeTable({
      TableName:tableName
    }).promise();
    console.log('Table retrieved', table)
  } catch (error) {
    if(error instanceof Error){
      // 返回error对象,表示这个table不存在
      return error
    }
    throw new Error('dynamodbDescribeTable error object unknown type')
  }
}

// TABLE 名字, records数量,lastEvaluatedKey是最后一个记录的主键以让dynamoDB继续扫描
// 这个函数返回一个generator, 每次调用next()方法, 返回一个records数组, 以及一个lastEvaluatedKey, 
// 如果records数组为空, 则表示已经扫描完毕, 否则, 继续调用next()方法, 直到records数组为空, 
// 或者调用者主动抛出异常结束扫描.
export const dynamodbScanTable = async function*(tableName:string,limit:number=25,lastEvaluatedKey?:AWS.DynamoDB.Key){
  while(true){
    const params:AWS.DynamoDB.ScanInput = {
      "TableName":tableName,
      "Limit":limit,
    }

    if(lastEvaluatedKey){
      params.ExclusiveStartKey = lastEvaluatedKey
    }

    try {
      const result = await dynamodb.scan(params).promise();
      if(!result.Count){
        return;
      }

      lastEvaluatedKey = (result as AWS.DynamoDB.ScanOutput).LastEvaluatedKey;
      result.Items = result.Items?.map((item)=>unmarshall(item));
      yield result;
    } catch (error) {
      if(error instanceof Error){
        throw error;
      }
      throw new Error('dynamodbScanTable error object unknown type')
    }
  }
}

export const getAllScanResults = async <T>(tableName:string,limit:number=25)=>{
  try {
    await dynamodbDescribeTable(tableName);

    const scanTableGen = await dynamodbScanTable(tableName,limit);

    const results: T[] = [];
    let isDone = false;

    while(!isDone){
      const iterator = await scanTableGen.next();

      if(!iterator){
        throw new Error('getAllScanResults error: scanTableGen.next() returned undefined');
      }

      if(iterator.done || !iterator.value.LastEvaluatedKey){
        isDone = true;
      }

      if (iterator.value){
        iterator.value.Items!.forEach((result:any)=>results.push(result))
      }
    }

    return results;
  } catch (error) {
    if(error instanceof Error){
      throw error;
    }

    throw new Error('getAllScanResults error object unknown type')
  }
}

export const dynamodbUpdateTweet = async (tableName:string,tweet:TweetFormatted,twitterId:string) => {
  try {
    const params:AWS.DynamoDB.UpdateItemInput = {
      TableName:tableName,
      Key: marshall({
        twitterId:twitterId
      }),
      UpdateExpression: "set #tweets = list_append(if_not_exists(#tweets, :empty_list), :tweet), #updated = :updated",
      ExpressionAttributeNames:{
        "#tweets": "tweets",
        "#updated": "updated"
      },
      ExpressionAttributeValues:marshall({
        ':tweet': [tweet],
        ':updated': Date.now(),
        ':empty_list': []
      })
    }

    const result = await dynamodb.updateItem(params).promise();
    console.log('Tweet updated', result)
    return result;
  } catch (error) {
    if(error instanceof Error){
      throw error;
    }

    throw new Error('dynamodbUpdateTweet error object unknown type')
  }
}