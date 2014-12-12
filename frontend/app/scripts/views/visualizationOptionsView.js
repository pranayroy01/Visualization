App.VisualizationOptionsView = Ember.ContainerView.extend({
    options: null, // structure or layout options
    config: null, // visualization configuration
    tagName: "ul",
    children: function() {
        this.clear();

        var options = this.get('options');
        var config = this.get('config');

        if ((config === null) || (options === null)) {
            return;
        }
        
        console.log("Creating visualization configuration view...");
        console.log('Structure options: ');
        console.dir(options);
        console.log('Visualization configuration: ');

        var optionNames = Object.getOwnPropertyNames(options);
        for (var i = 0; i < optionNames.length; i++) {
            
            var optionName = optionNames[i];          
            console.log('Option name: ');
            console.dir(optionName);
            
            var optionTemplate = options[optionName];
            console.log('Option template: ');
            console.dir(optionTemplate);
            console.dir(optionTemplate.value);
            
            //build the string from metadata types
            var types="";
            var used_types = [];
            for (var k=0; k< optionTemplate.metadata.types.length; k++){
                types += optionTemplate.metadata.types[k];
            }
            if (types.indexOf("any") > -1) {
                used_types.push("categorical-block");
                used_types.push("numerical-block");
            } else {
                if ((types.indexOf("string") > -1)) {
                    used_types.push("categorical-block");
                }
                if ((types.indexOf("date") > -1) || (types.indexOf("number") > -1) || (types.indexOf("ordinal") > -1) || (types.indexOf("distance") > -1)) {
                    used_types.push("numerical-block");
                }
            }
            console.log("View types: "+used_types.toString());
        
            
            var view = Ember.View.extend({
                tagName: "li",
                templateName: "vistemplates/" +
                        optionTemplate.template,
                name: optionName,
                label: optionTemplate.label,
                content: optionTemplate.value,
                metadata: optionTemplate.metadata.types,
                types: used_types,
                contentObserver: function() {
                    var content = this.get('content');                  
                    var name = this.get('name');
                    console.log("Changed option " + name + ":");
                    console.dir(content);

                    var configMap = config[0];
                    configMap[name] = content;
                    config.setObjects([configMap]);
                }.observes('content.@each').on('init')
            }).create();
            this.pushObject(view);
            console.log("Used types: "+view.get("types").toString());
        }
    }.observes('options').on('init')
});