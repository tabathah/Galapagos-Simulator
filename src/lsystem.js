// A class that represents a symbol replacement rule to
// be used when expanding an L-system grammar.
function Rule(prob, str) {
	this.probability = prob; // The probability that this Rule will be used when replacing a character in the grammar string
	this.successorString = str; // The string that will replace the char that maps to this Rule
}

function LinkedList(first, last)
{
	this.firstNode = first;
	this.lastNode = last;
}

class Node {

  constructor(symbol, next, prev, iter) 
  {
    // if we want to access these later, we need to bind them to 'this'
    this.next = next;
    this.prev = prev;
    this.symbol = symbol;
    this.num = iter;
  }

  setNext(newNext) 
  {
    this.next = newNext;
    newNext.prev = this;
  }

}

export function stringToLinkedList(input_string, iter) {
	var head = new Node(input_string.substring(0, 1), null, null, iter);
	var lastNode = head;
	for(var i = 1; i < input_string.length; i++)
	{
		var currNode = new Node(input_string.substring(i, i+1), null, null, iter);
		lastNode.setNext(currNode);
		lastNode = currNode;
	}
	var tail = lastNode;
	var newll = new LinkedList(head, tail)
	return newll;
}

export function linkedListToString(linkedList) {
	var result = "";
	var currNode = linkedList.firstNode;
	result = currNode.symbol;
	while(currNode.next != null)
	{
		currNode = currNode.next;
		result = result + currNode.symbol;
	}
	return result;
}

function replaceNode(linkedList, node, replacementString) {

	var first = node.prev;
	var last = node.next;

	if(first == null)
	{
		linkedList.firstNode = replacementString.firstNode;
	}
	else 
	{
		first.setNext(replacementString.firstNode);
	}

	if(last == null)
	{
		linkedList.lastNode = replacementString.lastNode;	
	}
	else
	{
		replacementString.lastNode.setNext(last);
	}
}

export default function Lsystem(axiom, grammar, iterations) {
	// default LSystem
	this.endBarkProb = 0.4; //should be based on environment
	this.grammar = {};
	this.axiom = 'S';
	this.grammar['S'] = [
		new Rule(0.3, 'S[+-<C]S[B]'),
		new Rule(0.1, 'S[B][B]'),
		new Rule(0.2, 'S[+-<C][B][B]'),
		new Rule(0.1, 'S[B][B]S[B]'),
		new Rule(0.2, 'S[+-<C][B]S[B]'),
		new Rule(0.1, 'S[B]'),
	];
	this.grammar['B'] = [
		new Rule(0.5, '+-S'),
		new Rule(0.5, '+-<C'),
	];
	this.grammar['C'] = [
		new Rule(0.5, 'C[+-C]'),
		new Rule(0.5, 'C[+-C][+-C]'),
	];
	this.iterations = 4; 
	
	// Set up the axiom string
	if (typeof axiom !== "undefined") {
		this.axiom = axiom;
	}

	// Set up the grammar as a dictionary that 
	// maps a single character (symbol) to a Rule.
	if (typeof grammar !== "undefined") {
		this.grammar = Object.assign({}, grammar);
	}
	
	// Set up iterations (the number of times you 
	// should expand the axiom in DoIterations)
	if (typeof iterations !== "undefined") {
		this.iterations = iterations;
	}

	// A function to alter the axiom string stored 
	// in the L-system
	this.updateAxiom = function(axiom) {
		// Setup axiom
		if (typeof axiom !== "undefined") {
			this.axiom = axiom;
		}
	}

	// This function returns a linked list that is the result 
	// of expanding the L-system's axiom n times.
	this.doIterations = function(n) {	
		var ebp = this.endBarkProb;
		var ax = "S";
		while(Math.random() > ebp)
		{
			ax = "T" + ax;
			ebp *= 2;
		}
		this.axiom = ax;
		this.lSystemLL = stringToLinkedList(this.axiom, n);
		for(var i = n-1; i >= 0; i--)
		{
			var currNode = this.lSystemLL.firstNode;
			while(currNode != null)
			{
				var rules = this.grammar[currNode.symbol];
				var rando = Math.random();
				var lastProb = 0.0;
				var index = 0;
				if(rules != undefined)
				{
					while(rando >= rules[index].probability+lastProb)
					{
						lastProb += rules[index].probability;
						index++;
					}
					replaceNode(this.lSystemLL, currNode, stringToLinkedList(rules[index].successorString, i));
				}				
				currNode = currNode.next;
			}
		}
		return this.lSystemLL;
	}
}