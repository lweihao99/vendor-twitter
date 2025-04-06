import { dynamodbDescribeTable, dynamodbScanTable } from "./aws"

const init = async () =>{
  // const res = await dynamodbDescribeTable('vendors');
  // console.log("🚀 ~ init ~ res:", res)
  const scanIterator = await dynamodbScanTable('vendors',5);
  console.log("🚀 ~ init ~ scanIterator:", (await scanIterator.next()).value)
  console.log("🚀 ~ init ~ scanIterator:", (await scanIterator.next()).value)
}

init();