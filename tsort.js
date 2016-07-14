var PicoMachine = function( config ) {
  this.name  = config.name;
  this.state = config.initialState;
  this.transitionsFor = {};
  this.callbacks = {};
};

PicoMachine.prototype.triggereable = function(event) {
  try{
    return this.transitionsFor[event][this.state];
  } catch(exception) {
    throw new Error("Invalid Event");
  }
};

PicoMachine.prototype.on = function(key, fn) {
  if(!this.callbacks[key]) this.callbacks[key] = [];
  this.callbacks[key].push(fn);
};

PicoMachine.prototype.trigger = function(event) {
  if( this.triggereable(event) ) {
    this.state = this.transitionsFor[event][this.state];
    callbacks = (this.callbacks[this.state] || []).concat(this.callbacks['any'] || []);
    for(var callback in callbacks) {
      if(typeof callbacks[callback] == 'function') callbacks[callback].apply(this);
    }
    return true;
  } else {
    return false;
  }
};


function Node ( id, fsm ) {
  this.id = id;
  this.fsm = fsm;
  this.children = [];
  this.parents  = [];
}

function Graph(config) {
  this.edges   = config.edges;
  this.states  = config.states;
  this.graph   = [];
  this.nodes   = {};
  this.sorted  = [];
  this.visited = {};
  this.path    = {};
}
Graph.prototype.Node = Node;

Graph.prototype.visit = function( nodeId, ancestors ) {

  var node  = this.nodes[ nodeId ],
      id    = node.id,
      scope = this;

  if ( scope.visited[ nodeId ] ){
    return;
  }
  if ( !Array.isArray(ancestors) ){
    ancestors = [];
  }

  ancestors.push( id );
  this.visited[nodeId] = true;

  node.children.forEach( function (afterId) {
    if ( ancestors.indexOf(afterId) >= 0 ){
      throw new Error(id + ' can not come before ' + afterId);
    }
    var aid = afterId.toString();
    var anc = ancestors.map(function (v) {
      return v
    });
    scope.visit(aid, anc);
  });

  this.sorted.unshift( id );
};

Graph.prototype.filter = function( string ) {
  return string !== null && typeof string !== 'undefined';
};

Graph.prototype.sort = function(){
  var scope = this;

  this.edges.forEach( function ( edge ) {
    var from = edge[0].name,
        to   = edge[1].name;

    if ( !scope.nodes[from] ){
      scope.nodes[from] = new scope.Node(from, edge[0]);
    }
    if ( !scope.nodes[to] ){
      scope.nodes[to] = new scope.Node(to, edge[1]);
    }
    if ( !~scope.nodes[to].parents.indexOf(from) ){
      scope.nodes[to].parents.push(from);
    }
    if ( !~scope.nodes[from].children.indexOf(to) ){
      scope.nodes[from].children.push(to);
    }
  });

  try {
    Object.keys( scope.nodes ).forEach( scope.visit.bind(this) );
  }
  catch (error) {
    // return { error: error }
    console.trace( error )
  };

  this.path = this.sorted.filter( this.filter.bind(this) );

  this.path.forEach(function (v) {
    var n = scope.nodes[v];
    n.children = n.children.filter( scope.filter.bind(scope) );
    n.parents  = n.parents.filter(  scope.filter.bind(scope) );
    scope.graph.push(n);
  });

  return {
    path  : this.path,
    graph : this.graph
  };
}



var A = new PicoMachine({ name : 'A', initialState : 'new' });
A.transitionsFor = {
  confirm : { new: 'confirmed' },
  ignore  : { new: 'ignored' },
  reset   : { confirmed: 'new', ignored: 'new' } };

var B = new PicoMachine({ name : 'B', initialState : 'new' });
B.transitionsFor = {
  confirm : { new: 'confirmed' },
  ignore  : { new: 'ignored' },
  reset   : { confirmed: 'new', ignored: 'new' } };

var C = new PicoMachine({ name : 'C', initialState : 'new' });
C.transitionsFor = {
  confirm : { new: 'confirmed' },
  ignore  : { new: 'ignored' },
  reset   : { confirmed: 'new', ignored: 'new' } };

var D = new PicoMachine({ name : 'D', initialState : 'new' });
D.transitionsFor = {
  confirm : { new: 'confirmed' },
  ignore  : { new: 'ignored' },
  reset   : { confirmed: 'new', ignored: 'new' } };

var E = new PicoMachine({ name : 'E', initialState : 'new' });
E.transitionsFor = {
  confirm : { new: 'confirmed' },
  ignore  : { new: 'ignored' },
  reset   : { confirmed: 'new', ignored: 'new' } };


var graph = new Graph({
  edges: [
    [ A, B ],
    [ A, C ],
    [ A, E ],
    [ B, D ],
    [ C, D ],
    [ C, E ],
    [ D, E ],
  ],
  states: [ 'start', 'stop', 'error' ],
});

graph.sort();