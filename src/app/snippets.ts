import { Snippet, ConnectionType } from '../rill';

export const snippets: Snippet[] = [
    {
        id: 'snippet1',
        name: 'Snippet 1',
        description: 'Some snippet 1 description goes here.',
        chunk: {
            "nodes": [
              {
                "id": "81ca14c2-3c82-4629-adb8-d75ece7e3a98",
                "class": "BrowserPrompt",
                "inputs": {
                  "message": ""
                },
                "outputs": {
                  "result": ""
                },
                "internal": {}
              },
              {
                "id": "89cef2c9-5929-4274-aa9b-39303f6a8534",
                "class": "ConsoleLog",
                "inputs": {
                  "message": "Default 3rd Msg"
                },
                "outputs": {},
                "internal": {
                  "skipEmpty": false
                }
              },
              {
                "id": "4d5800ca-917f-4d0e-ac0d-22f265249e9d",
                "class": "BrowserAlert",
                "inputs": {
                  "message": "Yo user"
                },
                "outputs": {},
                "internal": {}
              }
            ],
            "nodesDesign": {
              "81ca14c2-3c82-4629-adb8-d75ece7e3a98": {
                "pos": {
                  "x": 200,
                  "y": 200
                }
              },
              "89cef2c9-5929-4274-aa9b-39303f6a8534": {
                "pos": {
                  "x": 300,
                  "y": 300
                }
              },
              "4d5800ca-917f-4d0e-ac0d-22f265249e9d": {
                "pos": {
                  "x": 400,
                  "y": 400
                }
              }
            },
            "connections": [
              {
                "id": "0525c5bb-48a7-4e0f-b965-f3c2ffeb9569",
                "source": {
                  "node": "89cef2c9-5929-4274-aa9b-39303f6a8534",
                  "port": "out"
                },
                "destination": {
                  "node": "81ca14c2-3c82-4629-adb8-d75ece7e3a98",
                  "port": "in"
                },
                "type": "flow" as ConnectionType
              },
              {
                "id": "87ccb4ed-fc71-437a-8691-705854fb7ce5",
                "source": {
                  "node": "81ca14c2-3c82-4629-adb8-d75ece7e3a98",
                  "port": "out"
                },
                "destination": {
                  "node": "4d5800ca-917f-4d0e-ac0d-22f265249e9d",
                  "port": "in"
                },
                "type": "flow" as ConnectionType
              },
              {
                "id": "bd1b83ec-fe31-4f5f-812c-f5f8d312e4ef",
                "source": {
                  "node": "81ca14c2-3c82-4629-adb8-d75ece7e3a98",
                  "port": "result"
                },
                "destination": {
                  "node": "4d5800ca-917f-4d0e-ac0d-22f265249e9d",
                  "port": "message"
                },
                "type": "value" as ConnectionType
              }
            ],
            "ref": "rill",
            "version": 1
        }
    },
    {
        id: 'snippet2',
        name: 'Snippet 2',
        description: 'Some snippet 2 description goes here.',
        chunk: {
            "nodes": [
              {
                "id": "81ca14c2-3c82-4629-adb8-d75ece7e3a98",
                "class": "BrowserPrompt",
                "inputs": {
                  "message": ""
                },
                "outputs": {
                  "result": ""
                },
                "internal": {}
              },
              {
                "id": "89cef2c9-5929-4274-aa9b-39303f6a8534",
                "class": "ConsoleLog",
                "inputs": {
                  "message": "Default 3rd Msg"
                },
                "outputs": {},
                "internal": {
                  "skipEmpty": false
                }
              },
              {
                "id": "4d5800ca-917f-4d0e-ac0d-22f265249e9d",
                "class": "BrowserAlert",
                "inputs": {
                  "message": "Yo user"
                },
                "outputs": {},
                "internal": {}
              }
            ],
            "nodesDesign": {
              "81ca14c2-3c82-4629-adb8-d75ece7e3a98": {
                "pos": {
                  "x": 200,
                  "y": 200
                }
              },
              "89cef2c9-5929-4274-aa9b-39303f6a8534": {
                "pos": {
                  "x": 300,
                  "y": 300
                }
              },
              "4d5800ca-917f-4d0e-ac0d-22f265249e9d": {
                "pos": {
                  "x": 400,
                  "y": 400
                }
              }
            },
            "connections": [
              {
                "id": "0525c5bb-48a7-4e0f-b965-f3c2ffeb9569",
                "source": {
                  "node": "89cef2c9-5929-4274-aa9b-39303f6a8534",
                  "port": "out"
                },
                "destination": {
                  "node": "81ca14c2-3c82-4629-adb8-d75ece7e3a98",
                  "port": "in"
                },
                "type": "flow" as ConnectionType
              },
              {
                "id": "87ccb4ed-fc71-437a-8691-705854fb7ce5",
                "source": {
                  "node": "81ca14c2-3c82-4629-adb8-d75ece7e3a98",
                  "port": "out"
                },
                "destination": {
                  "node": "4d5800ca-917f-4d0e-ac0d-22f265249e9d",
                  "port": "in"
                },
                "type": "flow" as ConnectionType
              },
              {
                "id": "bd1b83ec-fe31-4f5f-812c-f5f8d312e4ef",
                "source": {
                  "node": "81ca14c2-3c82-4629-adb8-d75ece7e3a98",
                  "port": "result"
                },
                "destination": {
                  "node": "4d5800ca-917f-4d0e-ac0d-22f265249e9d",
                  "port": "message"
                },
                "type": "value" as ConnectionType
              }
            ],
            "ref": "rill",
            "version": 1
        }
    }
];