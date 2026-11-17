import { LambdaRestApi } from "aws-cdk-lib/aws-apigateway";
import { IFunction } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";

interface CorporationApiGatewayProps{
    productMicroservice: IFunction
} 

 export class CorporationApiGateway extends Construct {

    constructor(scope: Construct, id: string, props: CorporationApiGatewayProps){
        super(scope, id);

        const apigw = new LambdaRestApi(this, 'productApi', {
              restApiName: 'ProductService',
              handler: props.productMicroservice,
              proxy: false
            });
            
            const product = apigw.root.addResource('product')
            product.addMethod('GET')
            product.addMethod('POST')
        
            const singleProduct = product.addResource('{id}')
            singleProduct.addMethod('GET')
            singleProduct.addMethod('PUT')
            singleProduct.addMethod('DELETE')
          }
 }