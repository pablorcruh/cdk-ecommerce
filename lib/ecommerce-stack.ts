import * as cdk from 'aws-cdk-lib';
import { RemovalPolicy } from 'aws-cdk-lib';
import { LambdaRestApi } from 'aws-cdk-lib/aws-apigateway';
import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction, NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import { join } from 'path';

export class EcommerceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const productTable = new Table(this, 'product', {
      partitionKey: {
        name: 'id',
        type: AttributeType.STRING
      },
      tableName: 'product',
      removalPolicy: RemovalPolicy.DESTROY,
      billingMode: BillingMode.PAY_PER_REQUEST
    });

    const nodeJsFunctionProps: NodejsFunctionProps = {
      bundling: {
        externalModules: [
          'aws-sdk'
        ]
      },
      environment: {
        PRIMARY_KEY: 'id',
        DYNAMODB_TABLE_NAME: productTable.tableName
      },
      runtime: Runtime.NODEJS_LATEST
    }

    const productFunction = new NodejsFunction(this, 'product-function', {
      entry: join(__dirname, `/../src/product/index.js`),
      ...nodeJsFunctionProps
    });

    productTable.grantReadWriteData(productFunction);

    const apigw = new LambdaRestApi(this, 'productApi', {
      restApiName: 'ProductService',
      handler: productFunction,
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
