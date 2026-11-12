import { DeleteItemCommand, GetItemCommand, PutItemCommand, ScanCommand, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { ddbClient } from "./ddbClient";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import {v4 as uuidV4} from "uuid";;

export async function handler(event){
    
    switch(event.httpMethod){
        case "GET": 
            if(event.pathParameters !=null){
                body = await getProduct(event.pathParameters.id);
            }else{
                boby = await getAllProducts()
            }
        case "POST": 
            body = await createProduct(event)
            break;
        case "DELETE":
            body = await deleteProduct(event.pathParameters.id);
            break;
        case "PUT":
            body = await updateProduct(event);
            break;
        default:
            throw new Error(`Unsupported route: "${event.httpMethod}"`);
    }
           
    return {
        statusCode: 200,
        headers: {"Content-Type":"text/plain"},
        body: `hello from product`
    }
}

const getProduct = async(productId) =>{
    try{

        const params = {
            TableName: process.env.DYNAMODB_TABLE_NAME,
            key : marshall({id: productId})
        };

        const {Item} = await ddbClient.send(new GetItemCommand(params));
        return (Item) ? unmarshall(Item): {}

    }catch(e){
        console.error(e);
        throw e;
    }
}

const getAllProducts = async() => {
    try{
        const params = {
            TableName: process.env.DYNAMODB_TABLE_NAME
        };
        const {Items} = await ddbClient.send(new ScanCommand(params));
        return (Items)? Items.map((item)=> unmarshall(item)) : {};
    }catch(e){
        console.log(e);
        throw e;
    }
}

const createProduct = async(event) => {
    try{
        const productRequest = JSON.parse(event.body);

        const productId = uuidV4();
        productRequest.id = productId;

        const params = {
            TableName: process.env.DYNAMODB_TABLE_NAME,
            Item: marshall(productRequest || {})
        };
        const createResult =await ddbClient.send(new PutItemCommand(params));
        return createResult;
    }catch(e){
        console.error(e);
        throw e;
    }
}

const deleteProduct = async(productId) => {
    try{
        const params = {
            TableName: process.env.DYNAMODB_TABLE_NAME,
            Key: marshall({id: productId})
        };
        const deleteResult = await ddbClient.send(new DeleteItemCommand(params));
        return deleteResult;
    }catch(e){
        console.error(e);
        throw e;
    }
}

const updateProduct = async(event) => {
    try{
        const bodyRequest = JSON.parse(event.body);
        const objKeys = Object.keys(bodyRequest);

         const params = {
            TableName: process.env.DYNAMODB_TABLE_NAME,
            Key: marshall({ id: event.pathParameters.id }),
            UpdateExpression: `SET ${objKeys.map((_, index) => `#key${index} = :value${index}`).join(", ")}`,
            ExpressionAttributeNames: objKeys.reduce((acc, key, index) => ({
                ...acc,
                [`#key${index}`]: key,
            }), {}),
            ExpressionAttributeValues: marshall(objKeys.reduce((acc, key, index) => ({
                ...acc,
                [`:value${index}`]: requestBody[key],
            }), {})),
        };
        const updateResult =await ddbClient.send(new UpdateItemCommand(params));
        return updateResult;
    }catch(e){
        console.error(e);
        throw e;
    }
}
