import { dynamodbDescribeTable, dynamodbScanTable, dynamodbUpdateTweet, getAllScanResults } from "./aws"
import dotenv from 'dotenv';
import { Vendor } from './types/vendor';

dotenv.config()

const init = async () =>{
  // // const res = await dynamodbDescribeTable('vendors');
  // // console.log("🚀 ~ init ~ res:", res)
  // const scanIterator = await dynamodbScanTable('vendors',5);
  // console.log("🚀 ~ init ~ scanIterator:", (await scanIterator.next()).value)
  // console.log("🚀 ~ init ~ scanIterator:", (await scanIterator.next()).value)
  // const vendors = await getAllScanResults<Vendor>(process.env.AWS_VENDORS_TABLE_NAME ?? 'vendors',5);
  // console.log("🚀 ~ init ~ vendors:", vendors.length)

  await dynamodbUpdateTweet(process.env.AWS_VENDORS_TABLE_NAME ?? 'vendors',{
    id: '1234567890',
    userId: 'DCTacoTruck',
    userName: 'DC Taco Truck',
    text: 'Hello, world!',
    date: new Date().toISOString(),
    geo:{
      id: 'geo1',
      name: 'Geo location 1',
      place_type: 'place 1',
      full_name:'Full name 1',
      country:'USA',
      country_code: 'USA',
      coordinates: {
        lat: 12.3456,
        long: 78.9012
      }
    }
  },'DCTacoTruck')
}

init();