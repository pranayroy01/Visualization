/* input object
[
	{
		pattern: {xAxis: [[classURI1, xLabel, parentURI11, parentURI12, entityURI1]], - "year"
                          yAxis: [[classURI2, yLabel, parentURI21, parentURI22, entityURI2]], -"population"
                          group: [[classURI3, groupLabel, parentURI31, parentURI32, entityURI3]]  - "country"
                          } --- ["year","country"],"population"
		chart: "Column Chart"
	},
	{
		pattern: {xAxis: [[classURI1, xLabel, parentURI1,parentURI2,entityURI1]], - "country"
                          yAxis: [[classURI2, yLabel, parentURI3,parentURI4,entityURI2]], - "year"
                          groupBy: [],
                          addedSeries: []
                          } ---- "country","year"
		chart: "Line Chart"
	}
] */
function ranking(validPatterns)  {
    
    function finalLength(pattern)  {
        //count length of all pattern dimensions
            var len = 0;
            /*for (var i=0;i<pattern.length;i++){
                    if (Object.prototype.toString.call(pattern[i]) !=='[object Array]' ){
                            //if it is not an array
                            len ++;
                    } else {
                            //if subarray -  recursive function call
                            len+= finalLength(pattern[i]);
                    }
            }*/
            for (var property in pattern){
                len += pattern[property].length;
            }
            return len;
    };

    //comparator function for sort()
    function compare(a,b){
            return finalLength(a.pattern) - finalLength(b.pattern);
    };

//building the output

	//if input is empty => no valid allocations found
	if (validPatterns.length === 0){
		return "No valid patterns for the dataset";
	}

	//ranking - the larger the coverage the better
	var numAttributes = 3;
	var max = finalLength(validPatterns[0].pattern);

	//rank allocatoins
	validPatterns.sort(compare).reverse();

	//get necessary parameters		
	/*var ds_name = decodeURIComponent(req.query.name);
    var ds_location = decodeURIComponent(req.query.location);
    var ds_graph = decodeURIComponent(req.query.graph); // if rdf data source
    var ds_format = req.query.format;

    console.log('VISUALIZATION BACKEND: Retrieving recommendations for data source: ' + ds_name + ' ' + ds_location + ' ' + ds_format);
	*/
       
       
	//prepare infrastructure for building the configuration, test values
	var ds_model = null;
        var ds_name = "Newspaper Article Analysis";
        var ds_location = "http://localhost:8890/sparql";
        var ds_graph = "http://newspaper.org/articles_2007"; // if rdf data source
        var ds_format = "rdf";
        console.log('VISUALIZATION BACKEND: Retrieving recommendations for data source: ' + ds_name + ' ' + ds_location + ' ' + ds_format);

    if (ds_format === 'rdf') {
        ds_model = {
            name: ds_name,
            location: {endpoint: ds_location, graph: ds_graph},
            format: 'rdf'
        };
    }
    
    //prepare a configuration object for a top choice recommendation
    var configuration; 
    var dimensions = validPatterns[0].pattern;
    var dimensionValues = {};
        for (var dimension in dimensions){
            // get xAxis: [[classURI1, xLabel, parentURI11, parentURI12, entityURI1]]
            var axis = dimensions[dimension];
            var axisValues = [];
            
            for (var i=0; i<axis.length;i++){
                axisValues.push({
                    id: axis[i][0],
                    format: 'rdf',
                    label: axis[i][1],
                    location: {
                        endpoint: ds_location,
                        graph: ds_graph
                    },
                    parent: axis[i].slice(2)
                });
            }
            dimensionValues[dimension] = axisValues;
        }
    //build configuration for a top choice
    if (validPatterns[0].chart === "Line Chart") {
        //get pattern 
        
        
    	configuration  = {
    		id: 5345342,
	        name: "Line Chart",
	        thumbnail: "http://localhost:3002/thumbnails/line_chart.png",
	        structureOptions: {
	            dimensions: {
	                xAxis: {
	                    label: "Drag & drop a ordinal value",
	                    //value: [],
                            value: dimensionValues['xAxis'],
	                    metadata: {
	                        types: ["dates or ", "other continuous values such as distances"]
	                    }
	                },
	                yAxis: {
	                    label: "Drag & drop a measure",
	                    value: [],
	                    metadata: {
	                        types: ["number"]
	                    }
	                },
	                orderBy: {
	                    label: "Order by",
	                    value: [],
	                    metadata: {
	                        types: ["ordinal value "]
	                    }
	                },
	                addedSeries: {
	                    label: "Drag & drop additional series",
	                    value: [],
	                    metadata: {
	                        types: ["any"]
	                    }
	                }
	            }
	        },
	        layoutOptions: {
	            axis: {
	                hLabel: {
	                    label: "Horizontal Label",
	                    value: "",
	                    metadata: {
	                        types: ["string"]
	                    }
	                }, vLabel: {
	                    label: "Vertical Label",
	                    value: "",
	                    metadata: {
	                        types: ["string"]
	                    }
	                }, ticks: {
	                    label: "Ticks",
	                    value: 10,
	                    metadata: {
	                        types: ["number"]
	                    }
	                }, tooltip: {
	                    label: "Show Tooltip",
	                    value: false,
	                    metadata: {
	                        types: ["boolean"]
	                    }
	                }, gridlines: {
	                    label: "Gridlines",
	                    value: true,
	                    metadata: {
	                        types: ["boolean"]
	                    }
	                }
	            }
	        },
	        datasource: ds_model
    	};
    } else if (validPatterns[0].chart === "Column Chart") {
    	configuration = {
    		id: 282534,
	        name: "Column Chart",
	        thumbnail: "http://localhost:3002/thumbnails/column_chart.png",
	        structureOptions: {
	            dimensions: {
	                xAxis: {
	                    label: "Drag & drop categories",
	                    value: [],
	                    metadata: {
	                        types: ["string"]
	                    }
	                }, yAxis: {
	                    label: "Drag & drop a measure",
	                    value: [],
	                    metadata: {
	                        types: ["number"]
	                    }
	                }, group: {
	                    label: "Group by",
	                    value: [],
	                    metadata: {
	                        types: ["any"]
	                    }
	                }, stackedGroup: {
	                    label: "Build stacked groups by",
	                    value: [],
	                    metadata: {
	                        types: ["any"]
	                    }
	                }
	            }
	        },
	        layoutOptions: {
	            axis: {
	                hLabel: {
	                    label: "Horizontal Label",
	                    value: "",
	                    metadata: {
	                        types: ["string"]
	                    }
	                }, vLabel: {
	                    label: "Vertical Label",
	                    value: "",
	                    metadata: {
	                        types: ["string"]
	                    }
	                }, widthRatio: {
	                    label: "Bar Width",
	                    value: 0.5,
	                    metadata: {
	                        types: ["number"]
	                    }
	                }, gridlines: {
	                    label: "Show Gridlines",
	                    value: true,
	                    metadata: {
	                        types: ["boolean"]
	                    }
	                }, tooltip: {
	                    label: "Show Tooltip",
	                    value: false,
	                    metadata: {
	                        types: ["boolean"]
	                    }
	                }, horizontal: {
	                    label: "Draw horizontally",
	                    value: false,
	                    metadata: {
	                        types: ["boolean"]
	                    }
	                }
	            }
	        },
	        datasource: ds_model
    	};
    } else if (validPatterns[0].chart === "Area Chart") {
    	configuration = {
    		id: 386595,
	        name: "Area Chart",
	        thumbnail: "http://localhost:3002/thumbnails/area_chart.png",
	        structureOptions: {
	            dimensions: {
	                xAxis: {
	                    label: "Drag & drop a ordinal value",
	                    value: [],
	                    metadata: {
	                        types: ["dates or ", "other continuous values such as distances"]
	                    }
	                },
	                yAxis: {
	                    label: "Drag & drop a measure",
	                    value: [],
	                    metadata: {
	                        types: ["number"]
	                    }
	                },
	                orderBy: {
	                    label: "Order by",
	                    value: [],
	                    metadata: {
	                        types: ["ordinal value "]
	                    }
	                },
	                addedSeries: {
	                    label: "Drag & drop additional series",
	                    value: [],
	                    metadata: {
	                        types: ["any"]
	                    }
	                }
	            }
	        },
	        layoutOptions: {
	            axis: {
	                hLabel: {
	                    label: "Horizontal Label",
	                    value: "",
	                    metadata: {
	                        types: ["string"]
	                    }
	                }, vLabel: {
	                    label: "Vertical Label",
	                    value: "",
	                    metadata: {
	                        types: ["string"]
	                    }
	                }, ticks: {
	                    label: "Ticks",
	                    value: 10,
	                    metadata: {
	                        types: ["number"]
	                    }
	                }, tooltip: {
	                    label: "Show Tooltip",
	                    value: false,
	                    metadata: {
	                        types: ["boolean"]
	                    }
	                }, gridlines: {
	                    label: "Gridlines",
	                    value: true,
	                    metadata: {
	                        types: ["boolean"]
	                    }
	                }
	            }
	        },
	        datasource: ds_model
    	};
    } else if (validPatterns[0].chart === "Bubble Chart") {
    	configuration = {
    		id: 3144372,
	        name: "Bubble Chart",
	        thumbnail: "http://localhost:3002/thumbnails/bubble_chart.png",
	        structureOptions: {
	            dimensions: {
	                label: {
	                    label: "Label",
	                    value: [],
	                    metadata: {
	                        types: ["string"]
	                    }
	                },
	                xAxis: {
	                    label: "Horizontal Axis",
	                    value: [],
	                    metadata: {
	                        types: ["number"]
	                    }
	                },
	                yAxis: {
	                    label: "Vertical Axis",
	                    value: [],
	                    metadata: {
	                        types: ["number"]
	                    }
	                },
	                color: {
	                    label: "Color",
	                    value: [],
	                    metadata: {
	                        types: ["string"]
	                    }
	                },
	                radius: {
	                    label: "Radius",
	                    value: [],
	                    metadata: {
	                        types: ["number"]
	                    }
	                }

	            }
	        },
	        layoutOptions: {
	            axis: {
	                hLabel: {
	                    label: "Horizontal Label",
	                    value: "X Name",
	                    metadata: {
	                        types: ["string"]
	                    }
	                },
	                vLabel: {
	                    label: "Vertical Label",
	                    value: "Y Name",
	                    metadata: {
	                        types: ["string"]
	                    }
	                },
	                ticks: {
	                    label: "Ticks",
	                    value: 10,
	                    metadata: {
	                        types: ["number"]
	                    }
	                },
	                tooltip: {
	                    label: "Show Tooltip",
	                    value: false,
	                    metadata: {
	                        types: ["boolean"]
	                    }
	                },
	                gridlines: {
	                    label: "Gridlines",
	                    value: true,
	                    metadata: {
	                        types: ["boolean"]
	                    }
	                }
	            }
	        },
	        datasource: ds_model
    	};
    } else if (validPatterns[0].chart === "Scatter Chart") {
    	configuration = {
    		id: 382774,
	        name: "Scatter Chart",
	        thumbnail: "http://localhost:3002/thumbnails/scatter_chart.png",
	        structureOptions: {
	            dimensions: {
	                yAxis: {
	                    label: "Vertical Axis",
	                    value: [],
	                    metadata: {
	                        types: ["number"]
	                    }
	                },
	                xAxis: {
	                    label: "Horizontal Axis",
	                    value: [],
	                    metadata: {
	                        types: ["number, ", "string or ", "date"]
	                    }
	                },
	                group: {
	                    label: "Groups",
	                    value: [],
	                    metadata: {
	                        types: ["date, ", "number or ", "string"]
	                    }
	                }
	            }
	        },
	        layoutOptions: {
	            axis: {
	                hLabel: {
	                    label: "Horizontal Label",
	                    value: "X Name",
	                    metadata: {
	                        types: ["string"]
	                    }
	                },
	                vLabel: {
	                    label: "Vertical Label",
	                    value: "Y Name",
	                    metadata: {
	                        types: ["string"]
	                    }
	                },
	                gridlines: {
	                    label: "Show Gridlines",
	                    value: false,
	                    metadata: {
	                        types: ["boolean"]
	                    }
	                },
	                ticks: {
	                    label: "Ticks",
	                    value: 5,
	                    metadata: {
	                        types: ["number"]
	                    }
	                },
	                tooltip: {
	                    label: "Show Tooltip",
	                    value: false,
	                    metadata: {
	                        types: ["boolean"]
	                    }
	                }
	            }
	        },
	        datasource: ds_model
    	};
    } else if (validPatterns[0].chart === "Pie Chart") {
    	configuration = {
    		id: 351574,
	        name: "Pie Chart",
	        thumbnail: "http://localhost:3002/thumbnails/pie_chart.png",
	        structureOptions: {
	            dimensions: {
	                measure: {
	                    label: "Drag & drop measure",
	                    value: [],
	                    metadata: {
	                        types: ["number"]
	                    }
	                },
	                slice: {
	                    label: "Drag & drop series",
	                    value: [],
	                    metadata: {
	                        types: ["any"]
	                    }
	                }
	            }
	        },
	        layoutOptions: {
	            tooltip: {
	                label: "Show Tooltip",
	                value: true,
	                metadata: {
	                    types: ["boolean"]
	                }
	            }
	        },
	        datasource: ds_model
    	};
    } else if (validPatterns[0].chart === "Map") {
    	configuration = {
    		id: 34223494,
	        name: "Map",
	        thumbnail: "http://localhost:3002/thumbnails/map.png",
	        structureOptions: {
	            dimensions: {
	                label: {
	                    label: "Label",
	                    value: [],
	                    metadata: {
	                        types: ["number, ", "string or ", "date"]
	                    }
	                },
	                lat: {
	                    label: "Latitude",
	                    value: [],
	                    metadata: {
	                        types: ["number"]
	                    }
	                },
	                long: {
	                    label: "Longitude",
	                    value: [],
	                    metadata: {
	                        types: ["number"]
	                    }
	                },
	                indicator: {
	                    label: "Indicator",
	                    value: [],
	                    metadata: {
	                        types: ["number"]
	                    }
	                }
	            }
	        },
	        layoutOptions: {
	        },
	        datasource: ds_model
    	};
    }
	
	return {
		validPatterns: validPatterns,
		configuration: configuration
	};
    



};