App.ContainerView = Ember.ContainerView.extend({
    childViews: ['layoutOptionsView','structureOptionsView'],
    layoutOptionsView : Ember.ContainerView.extend({
        childViews: ['tuningWidthHeightView'],
        tuningHeightWidthView: Ember.View.create({
            
        })
    }),
    structureOptionsView: Ember.ContainerView.extend({
        
    })
    
});

