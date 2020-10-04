const aws = require('aws-sdk');

const dynamo = new aws.DynamoDB();
const docClient = new aws.DynamoDB.DocumentClient();

const tableName = 'yogalates-classes';

exports.handler = async (event) => {
    return new Promise(async (resolve, reject) => {
        let response = {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: ''
        };

        const done = (err, res) => {
            if (!err){
                response.body = JSON.stringify(res);
                resolve(response);
            } else {
                response.body = JSON.stringify(err);
                response.statusCode = 400;
                reject(response);
            }
        }

        switch (event.httpMethod) {
            case 'GET':
                const getParams = {
                    TableName: tableName
                }
                docClient.scan(getParams, (err, data) => {
                    let items = [];
                    if (data.Items){
                        items = data.Items;
                    }
                    console.log(err, items);
                    done(null, items);
                });
                break;
            case 'POST':
                const classObject = JSON.parse(event.body);

                const postParams = {
                    TableName: tableName,
                    Item:{
                        'slug': classObject.slug,
                        'time': classObject.time,
                        'text': classObject.text,
                        'postCode': classObject.postCode,
                        'name': classObject.name,
                        'link': classObject.link,
                        'city': classObject.city,
                        'address1': classObject.address1,
                        'address2': classObject.address2
                    }
                };

                docClient.put(postParams, async (err, data) => {
                    if (err) {
                        console.log("ERR: ", err);
                        done('Unable to create item. Error JSON: ' + JSON.stringify(err));
                    } else {
                        console.log("PutItem succeeded:", JSON.stringify(data, null, 2));
                        const clearCacheResult = await clearCache('Prod');
                        console.log(clearCacheResult);
                        done(null, {success: true});
                    }
                });
                break;
            case 'DELETE':
                const classSlug = event.pathParameters.classSlug;

                const deleteParams = {
                    Key: {
                        "slug": {
                            S: classSlug
                        }
                    },
                    TableName: tableName
                }
                console.log(deleteParams);
                dynamo.deleteItem(deleteParams, async (err, res) => {
                    if (err){
                        console.error(err);
                        done(err);
                    } else {
                        console.log('Result:', res);
                        const clearCacheResult = await clearCache('Prod');
                        console.log('Clear cache result:', clearCacheResult);
                        done(null, {success: true});
                    }
                });
                break;
            default:
                done(new Error(`Unsupported method "${event.httpMethod}"`));
        }
    });
}
