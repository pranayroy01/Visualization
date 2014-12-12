// TREE VIEW
App.TreeBranchComponent = Ember.Component.extend({
    tagName: 'ul',
    classNames: ['tree-branch'],
    
    children: function() {
        var node = this.get('node');

        if (node.getChildren) {
            return node.getChildren(node);
        } else {
            return [];
        }
    }.property('node')
});

App.TreeNodeComponent = Ember.Component.extend({
    tagName: 'li',
    classNames: ['tree-node'],
    classNameBindings: ['categoricalLabel','numericalLabel'],
    categoricalLabel: function(){
        var node = this.get('node');
        return false;
    }.property('categoricalLabel'),
    numericalLabel: function(){
        var node = this.get('node');
        if (node.draggable === "true") {
            return false;
        }
        else {
            return false;
        }
    }.property('numericalLabel'),
    init: function() {
        this._super();
        this.set('isExpanded', this.get('node.expanded') || false);
    },
    toggle: function() {
        this.toggleProperty('isExpanded');
    },
    dragStart: function(event) {
        console.log("DRAG START")
        if (!this.get('node.draggable')) {
            return;
        }

        event.stopPropagation();
        var data = this.get('node.data');
        
        event.dataTransfer.setData('text/plain', JSON.stringify(data));
        event.dataTransfer.effectAllowed = "copy";
    }
});