import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { CorporationDatabase } from './database';
import { CorporationMicroservices } from './microservice';
import { CorporationApiGateway } from './apigateway';

export class EcommerceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const database = new CorporationDatabase(this, 'Database');
  
    const productMicroservice = new CorporationMicroservices(this, "product-functions",{
      productTable: database.productTable
    });

    const apigw = new CorporationApiGateway(this, 'productApi', {
      productMicroservice: productMicroservice.productFunction
    });
  }
}   

