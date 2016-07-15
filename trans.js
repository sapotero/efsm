
function Transition( config ){
  this.name      = config.name;
  this.childrens = config.childrens || [];
  this.parents   = config.parents   || [];
  this.value     = config.value     || '';
  this.callback  = config.callback  || function(){};
  this.oldValue  = this.value;
  this.state     = 'clean';
  this.queue     = {};
  this.createQueue();
}
Transition.prototype.Transition = Transition;

Transition.prototype.push = function(){
  // console.log( 'Transition.prototype.push', this);
  if ( this.childrens.length ) {
    var scope = this;
    this.childrens.forEach( function( child ){
      child.pull({
        from  : scope.name,
        value : scope.value,
      });
    });
  }
  this.clean();
}

Transition.prototype.pull = function( from ){
  // console.log( 'Transition.prototype.pull', this, from);
  this.createQueue();

  if ( this.queue.length === 0 ){
    this.clean();
  } else {
    if ( this.queue.hasOwnProperty( from.name ) ) {
      this.saveOld( from.value );
      delete this.queue[ from.name ];
    }
  }

  this.change( from.value );
}

Transition.prototype.saveOld = function( value ){
  this.oldValue = this.value;
  this.value = value;
  return this;
}

Transition.prototype.change = function( value ){

  if ( value.hasOwnProperty('from') ) {
    value = value.value
  }

  this.saveOld(value);
  this.calculating();
  this.createQueue()
  this.push();
  this.callback();
  
  return this;
}

Transition.prototype.calculating = function(){
  this.state = 'calculate';
  return this;
}
Transition.prototype.error = function(){
  this.state = 'error';
  return this;
}
Transition.prototype.clean = function(){
  this.state = 'clean';
  return this;
}

Transition.prototype.status = function(){
  return this.state;
}

Transition.prototype.createQueue = function(){
  var scope = this;

  if ( this.parents.length ) {
    this.parents.forEach( function( parent ){
      // console.log( 'createQueue', parent, scope );
      scope.queue[ parent.name ] = parent;
    });
  } else {
    this.queue = [];
  }

  return this;
}

Transition.prototype.cleanQueue = function(){
  this.queue = [];
  return this;
}

Transition.prototype.addChild = function( options ){
  options.parents = [ this ]
  
  var transition = new this.Transition( options );
  
  this.childrens.push( transition );
  
  return transition;
}