import { ITable } from "aws-cdk-lib/aws-dynamodb";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction, NodejsFunctionProps } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import { join } from "path";


interface CorporationMicroservicesProps{
    productTable: ITable
}

export class CorporationMicroservices extends Construct{

    public readonly productFunction: NodejsFunction;

    constructor(scope: Construct, id: string, props: CorporationMicroservicesProps){
        super(scope, id);

        const nodeJsFunctionProps: NodejsFunctionProps = {
          bundling: {
            externalModules: [
              'aws-sdk'
            ]
          },
          environment: {
            PRIMARY_KEY: 'id',
            DYNAMODB_TABLE_NAME: props.productTable.tableName
          },
          runtime: Runtime.NODEJS_LATEST
        }
    
        const productFunction = new NodejsFunction(this, 'product-function', {
          entry: join(__dirname, `/../src/product/index.js`),
          ...nodeJsFunctionProps
        });
        this.productFunction = productFunction;

        props.productTable.grantReadWriteData(productFunction);
    }
}