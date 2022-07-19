export const demoDoc = `{
  "openapi": "3.0.0",
  "info": {
    "title": "Bodies",
    "version": "1.0"
  },
  "components": {
    "schemas": {
      "EnumType": {
        "type": "string",
        "enum": [
          "A",
          "B",
          "C"
        ]
      },
      "PrimitiveTupleType": {
        "type": "array",
        "prefixItems": [
          {
            "type": "string",
            "const": "Literal Value"
          },
          {
            "type": "string"
          },
          {
            "type": "number"
          },
          {
            "$ref": "#/components/schemas/EnumType"
          },
          {
            "type": "boolean"
          }
        ],
        "minItems": 5
      },
      "PrimitiveOptionalTupleType": {
        "type": "array",
        "prefixItems": [
          {
            "type": "string",
            "const": "Literal Value"
          },
          {
            "type": "string"
          },
          {
            "type": "number"
          },
          {
            "$ref": "#/components/schemas/EnumType"
          },
          {
            "type": "boolean"
          }
        ],
        "minItems": 0
      },
      "ObjectWithArrays": {
        "type": "object",
        "required": [
          "strArr",
          "numArr",
          "enmArr",
          "boolArr"
        ],
        "properties": {
          "strArr": {
            "type": "array",
            "items": {
              "type": "string"
            }
          },
          "numArr": {
            "type": "array",
            "items": {
              "type": "number"
            }
          },
          "enmArr": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/EnumType"
            }
          },
          "boolArr": {
            "type": "array",
            "items": {
              "type": "boolean"
            }
          }
        }
      },
      "ObjectWithPrimitives": {
        "type": "object",
        "required": [
          "str",
          "num",
          "enm",
          "bool",
          "lit"
        ],
        "properties": {
          "lit": {
            "type": "string",
            "const": "Literal Value"
          },
          "str": {
            "type": "string"
          },
          "num": {
            "type": "number"
          },
          "enm": {
            "$ref": "#/components/schemas/EnumType"
          },
          "bool": {
            "type": "boolean"
          }
        }
      },
      "ObjectWithNestedObjects": {
        "type": "object",
        "required": [
          "primObj",
          "arrObj"
        ],
        "properties": {
          "primObj": {
            "$ref": "#/components/schemas/ObjectWithPrimitives"
          },
          "arrObj": {
            "$ref": "#/components/schemas/ObjectWithArrays"
          }
        }
      }
    }
  },
  "paths": {
    "/str": {
      "post": {
        "operationId": "str",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "string"
              }
            },
            "application/yaml": {
              "schema": {
                "type": "string"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Response for content str.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "string"
                }
              },
              "application/yaml": {
                "schema": {
                  "type": "string"
                }
              }
            }
          }
        }
      }
    },
    "/num": {
      "post": {
        "operationId": "num",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "number"
              }
            },
            "application/yaml": {
              "schema": {
                "type": "number"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Response for content num.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "number"
                }
              },
              "application/yaml": {
                "schema": {
                  "type": "number"
                }
              }
            }
          }
        }
      }
    },
    "/enm": {
      "post": {
        "operationId": "enm",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/EnumType"
              }
            },
            "application/yaml": {
              "schema": {
                "$ref": "#/components/schemas/EnumType"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Response for content enm.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/EnumType"
                }
              },
              "application/yaml": {
                "schema": {
                  "$ref": "#/components/schemas/EnumType"
                }
              }
            }
          }
        }
      }
    },
    "/bool": {
      "post": {
        "operationId": "bool",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "boolean"
              }
            },
            "application/yaml": {
              "schema": {
                "type": "boolean"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Response for content bool.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "boolean"
                }
              },
              "application/yaml": {
                "schema": {
                  "type": "boolean"
                }
              }
            }
          }
        }
      }
    },
    "/prim-tuple": {
      "post": {
        "operationId": "primTuple",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/PrimitiveTupleType"
              }
            },
            "application/yaml": {
              "schema": {
                "$ref": "#/components/schemas/PrimitiveTupleType"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Response for content prim-tuple.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/PrimitiveTupleType"
                }
              },
              "application/yaml": {
                "schema": {
                  "$ref": "#/components/schemas/PrimitiveTupleType"
                }
              }
            }
          }
        }
      }
    },
    "/opt-prim-tuple": {
      "post": {
        "operationId": "optPrimTuple",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/PrimitiveOptionalTupleType"
              }
            },
            "application/yaml": {
              "schema": {
                "$ref": "#/components/schemas/PrimitiveOptionalTupleType"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Response for content opt-prim-tuple.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/PrimitiveOptionalTupleType"
                }
              },
              "application/yaml": {
                "schema": {
                  "$ref": "#/components/schemas/PrimitiveOptionalTupleType"
                }
              }
            }
          }
        }
      }
    },
    "/str-arr": {
      "post": {
        "operationId": "strArr",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "array",
                "items": {
                  "type": "string"
                }
              }
            },
            "application/yaml": {
              "schema": {
                "type": "array",
                "items": {
                  "type": "string"
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Response for content str-arr.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "type": "string"
                  }
                }
              },
              "application/yaml": {
                "schema": {
                  "type": "array",
                  "items": {
                    "type": "string"
                  }
                }
              }
            }
          }
        }
      }
    },
    "/num-arr": {
      "post": {
        "operationId": "numArr",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "array",
                "items": {
                  "type": "number"
                }
              }
            },
            "application/yaml": {
              "schema": {
                "type": "array",
                "items": {
                  "type": "number"
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Response for content num-arr.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "type": "number"
                  }
                }
              },
              "application/yaml": {
                "schema": {
                  "type": "array",
                  "items": {
                    "type": "number"
                  }
                }
              }
            }
          }
        }
      }
    },
    "/enm-arr": {
      "post": {
        "operationId": "enmArr",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "array",
                "items": {
                  "$ref": "#/components/schemas/EnumType"
                }
              }
            },
            "application/yaml": {
              "schema": {
                "type": "array",
                "items": {
                  "$ref": "#/components/schemas/EnumType"
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Response for content enm-arr.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "$ref": "#/components/schemas/EnumType"
                  }
                }
              },
              "application/yaml": {
                "schema": {
                  "type": "array",
                  "items": {
                    "$ref": "#/components/schemas/EnumType"
                  }
                }
              }
            }
          }
        }
      }
    },
    "/bool-arr": {
      "post": {
        "operationId": "boolArr",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "array",
                "items": {
                  "type": "boolean"
                }
              }
            },
            "application/yaml": {
              "schema": {
                "type": "array",
                "items": {
                  "type": "boolean"
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Response for content bool-arr.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "type": "boolean"
                  }
                }
              },
              "application/yaml": {
                "schema": {
                  "type": "array",
                  "items": {
                    "type": "boolean"
                  }
                }
              }
            }
          }
        }
      }
    },
    "/prim-obj": {
      "post": {
        "operationId": "primObj",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/ObjectWithPrimitives"
              }
            },
            "application/yaml": {
              "schema": {
                "$ref": "#/components/schemas/ObjectWithPrimitives"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Response for content prim-obj.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ObjectWithPrimitives"
                }
              },
              "application/yaml": {
                "schema": {
                  "$ref": "#/components/schemas/ObjectWithPrimitives"
                }
              }
            }
          }
        }
      }
    },
    "/arr-obj": {
      "post": {
        "operationId": "arrObj",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/ObjectWithArrays"
              }
            },
            "application/yaml": {
              "schema": {
                "$ref": "#/components/schemas/ObjectWithArrays"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Response for content arr-obj.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ObjectWithArrays"
                }
              },
              "application/yaml": {
                "schema": {
                  "$ref": "#/components/schemas/ObjectWithArrays"
                }
              }
            }
          }
        }
      }
    },
    "/nested-obj": {
      "post": {
        "operationId": "nestedObj",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/ObjectWithNestedObjects"
              }
            },
            "application/yaml": {
              "schema": {
                "$ref": "#/components/schemas/ObjectWithNestedObjects"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Response for content nested-obj.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ObjectWithNestedObjects"
                }
              },
              "application/yaml": {
                "schema": {
                  "$ref": "#/components/schemas/ObjectWithNestedObjects"
                }
              }
            }
          }
        }
      }
    }
  }
}`
