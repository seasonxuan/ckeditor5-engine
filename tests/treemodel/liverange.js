/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: treemodel */

'use strict';

const modules = bender.amd.require(
	'core/treemodel/document',
	'core/treemodel/element',
	'core/treemodel/position',
	'core/treemodel/liverange',
	'core/treemodel/range',
	'core/emittermixin'
);

describe( 'LiveRange', () => {
	let Document, Element, Position, LiveRange, Range, EmitterMixin;
	let doc, root, ul, p;

	before( () => {
		Document = modules[ 'core/treemodel/document' ];
		Element = modules[ 'core/treemodel/element' ];
		Position = modules[ 'core/treemodel/position' ];
		LiveRange = modules[ 'core/treemodel/liverange' ];
		Range = modules[ 'core/treemodel/range' ];
		EmitterMixin = modules[ 'core/emittermixin' ];

		doc = new Document();
		root = doc.createRoot( 'root' );

		let lis = [
			new Element( 'li', [], 'aaaaaaaaaa' ),
			new Element( 'li', [], 'bbbbbbbbbb' ),
			new Element( 'li', [], 'cccccccccc' ),
			new Element( 'li', [], 'dddddddddd' ),
			new Element( 'li', [], 'eeeeeeeeee' ),
			new Element( 'li', [], 'ffffffffff' ),
			new Element( 'li', [], 'gggggggggg' ),
			new Element( 'li', [], 'hhhhhhhhhh' )
		];

		ul = new Element( 'ul', [], lis );
		p = new Element( 'p', [], 'qwertyuiop' );

		root.insertChildren( 0, [ ul, p, 'xyzxyz' ] );
	} );

	it( 'should be an instance of Range', () => {
		let live = new LiveRange( new Position( root, [ 0 ] ), new Position( root, [ 1 ] ) );
		live.detach();

		expect( live ).to.be.instanceof( Range );
	} );

	it( 'should listen to a change event of the document that owns this range', () => {
		sinon.spy( LiveRange.prototype, 'listenTo' );

		let live = new LiveRange( new Position( root, [ 0 ] ), new Position( root, [ 1 ] ) );
		live.detach();

		expect( live.listenTo.calledWith( doc, 'change' ) ).to.be.true;

		LiveRange.prototype.listenTo.restore();
	} );

	it( 'should stop listening when detached', () => {
		sinon.spy( LiveRange.prototype, 'stopListening' );

		let live = new LiveRange( new Position( root, [ 0 ] ), new Position( root, [ 1 ] ) );
		live.detach();

		expect( live.stopListening.called ).to.be.true;

		LiveRange.prototype.stopListening.restore();
	} );

	it( 'createFromElement should return LiveRange', () => {
		let range = LiveRange.createFromElement( p );
		expect( range ).to.be.instanceof( LiveRange );
		range.detach();
	} );

	it( 'createFromParentsAndOffsets should return LiveRange', () => {
		let range = LiveRange.createFromParentsAndOffsets( root, 0, p, 2 );
		expect( range ).to.be.instanceof( LiveRange );
		range.detach();
	} );

	it( 'createFromPositionAndShift should return LiveRange', () => {
		let range = LiveRange.createFromPositionAndShift( new Position( root, [ 0, 1 ] ), 4 );
		expect( range ).to.be.instanceof( LiveRange );
		range.detach();
	} );

	it( 'createFromRange should return LiveRange', () => {
		let range = LiveRange.createFromRange( new Range( new Position( root, [ 0 ] ), new Position( root, [ 1 ] ) ) );
		expect( range ).to.be.instanceof( LiveRange );
		range.detach();
	} );

	// Examples may seem weird when you compare them with the tree structure generated at the beginning of tests.
	// Since change event is fired _after_ operation is executed on tree model, you have to imagine that generated
	// structure is representing what is _after_ operation is executed. So live LiveRange properties are describing
	// virtual tree that is not existing anymore and event ranges are operating on the tree generated above.
	describe( 'should get transformed if', () => {
		let live;

		beforeEach( () => {
			live = new LiveRange( new Position( root, [ 0, 1, 4 ] ), new Position( root, [ 0, 2, 2 ] ) );
		} );

		afterEach( () => {
			live.detach();
		} );

		describe( 'insertion', () => {
			it( 'is in the same parent as range start and before it', () => {
				let insertRange = new Range( new Position( root, [ 0, 1, 0 ] ), new Position( root, [ 0, 1, 4 ] ) );

				doc.fire( 'change', 'insert', { range: insertRange }, null );

				expect( live.start.path ).to.deep.equal( [ 0, 1, 8 ] );
				expect( live.end.path ).to.deep.equal( [ 0, 2, 2 ] );
			} );

			it( 'is in the same parent as range end and before it', () => {
				let insertRange = new Range( new Position( root, [ 0, 2, 0 ] ), new Position( root, [ 0, 2, 3 ] ) );

				doc.fire( 'change', 'insert', { range: insertRange }, null );

				expect( live.start.path ).to.deep.equal( [ 0, 1, 4 ] );
				expect( live.end.path ).to.deep.equal( [ 0, 2, 5 ] );
			} );

			it( 'is at a position before a node from range start path', () => {
				let insertRange = new Range( new Position( root, [ 0, 0 ] ), new Position( root, [ 0, 2 ] ) );

				doc.fire( 'change', 'insert', { range: insertRange }, null );

				expect( live.start.path ).to.deep.equal( [ 0, 3, 4 ] );
				expect( live.end.path ).to.deep.equal( [ 0, 4, 2 ] );
			} );

			it( 'is at a position before a node from range end path', () => {
				let insertRange = new Range( new Position( root, [ 0, 2 ] ), new Position( root, [ 0, 3 ] ) );

				doc.fire( 'change', 'insert', { range: insertRange }, null );

				expect( live.start.path ).to.deep.equal( [ 0, 1, 4 ] );
				expect( live.end.path ).to.deep.equal( [ 0, 3, 2 ] );
			} );
		} );

		describe( 'range move', () => {
			it( 'is to the same parent as range start and before it', () => {
				let moveSource = new Position( root, [ 2 ] );
				let moveRange = new Range( new Position( root, [ 0, 1, 0 ] ), new Position( root, [ 0, 1, 4 ] ) );

				let changes = {
					range: moveRange,
					sourcePosition: moveSource
				};
				doc.fire( 'change', 'move', changes, null );

				expect( live.start.path ).to.deep.equal( [ 0, 1, 8 ] );
				expect( live.end.path ).to.deep.equal( [ 0, 2, 2 ] );
			} );

			it( 'is to the same parent as range end and before it', () => {
				let moveSource = new Position( root, [ 2 ] );
				let moveRange = new Range( new Position( root, [ 0, 2, 0 ] ), new Position( root, [ 0, 2, 4 ] ) );

				let changes = {
					range: moveRange,
					sourcePosition: moveSource
				};
				doc.fire( 'change', 'move', changes, null );

				expect( live.start.path ).to.deep.equal( [ 0, 1, 4 ] );
				expect( live.end.path ).to.deep.equal( [ 0, 2, 6 ] );
			} );

			it( 'is to a position before a node from range start path', () => {
				let moveSource = new Position( root, [ 2 ] );
				let moveRange = new Range( new Position( root, [ 0, 0 ] ), new Position( root, [ 0, 2 ] ) );

				let changes = {
					range: moveRange,
					sourcePosition: moveSource
				};
				doc.fire( 'change', 'move', changes, null );

				expect( live.start.path ).to.deep.equal( [ 0, 3, 4 ] );
				expect( live.end.path ).to.deep.equal( [ 0, 4, 2 ] );
			} );

			it( 'is to a position before a node from range end path', () => {
				let moveSource = new Position( root, [ 2 ] );
				let moveRange = new Range( new Position( root, [ 0, 2 ] ), new Position( root, [ 0, 3 ] ) );

				let changes = {
					range: moveRange,
					sourcePosition: moveSource
				};
				doc.fire( 'change', 'move', changes, null );

				expect( live.start.path ).to.deep.equal( [ 0, 1, 4 ] );
				expect( live.end.path ).to.deep.equal( [ 0, 3, 2 ] );
			} );

			it( 'is from the same parent as range start and before it', () => {
				let moveSource = new Position( root, [ 0, 1, 0 ] );
				let moveRange = new Range( new Position( root, [ 2, 0 ] ), new Position( root, [ 2, 3 ] ) );

				let changes = {
					range: moveRange,
					sourcePosition: moveSource
				};
				doc.fire( 'change', 'move', changes, null );

				expect( live.start.path ).to.deep.equal( [ 0, 1, 1 ] );
				expect( live.end.path ).to.deep.equal( [ 0, 2, 2 ] );
			} );

			it( 'is from the same parent as range end and before it', () => {
				let moveSource = new Position( root, [ 0, 2, 0 ] );
				let moveRange = new Range( new Position( root, [ 2, 0 ] ), new Position( root, [ 2, 2 ] ) );

				let changes = {
					range: moveRange,
					sourcePosition: moveSource
				};
				doc.fire( 'change', 'move', changes, null );

				expect( live.start.path ).to.deep.equal( [ 0, 1, 4 ] );
				expect( live.end.path ).to.deep.equal( [ 0, 2, 0 ] );
			} );

			it( 'is from a position before a node from range start path', () => {
				let moveSource = new Position( root, [ 0, 0 ] );
				let moveRange = new Range( new Position( root, [ 2, 0 ] ), new Position( root, [ 2, 1 ] ) );

				let changes = {
					range: moveRange,
					sourcePosition: moveSource
				};
				doc.fire( 'change', 'move', changes, null );

				expect( live.start.path ).to.deep.equal( [ 0, 0, 4 ] );
				expect( live.end.path ).to.deep.equal( [ 0, 1, 2 ] );
			} );

			it( 'intersects on live range left side', () => {
				let moveSource = new Position( root, [ 0, 1, 2 ] );
				let moveRange = new Range( new Position( root, [ 2, 0 ] ), new Position( root, [ 2, 4 ] ) );

				let changes = {
					range: moveRange,
					sourcePosition: moveSource
				};
				doc.fire( 'change', 'move', changes, null );

				expect( live.start.path ).to.deep.equal( [ 0, 1, 2 ] );
				expect( live.end.path ).to.deep.equal( [ 0, 2, 2 ] );
			} );

			it( 'intersects on live range right side', () => {
				let moveSource = new Position( root, [ 0, 2, 1 ] );
				let moveRange = new Range( new Position( root, [ 2, 0 ] ), new Position( root, [ 2, 4 ] ) );

				let changes = {
					range: moveRange,
					sourcePosition: moveSource
				};
				doc.fire( 'change', 'move', changes, null );

				expect( live.start.path ).to.deep.equal( [ 0, 1, 4 ] );
				expect( live.end.path ).to.deep.equal( [ 0, 2, 1 ] );
			} );

			it( 'intersects on live range left side and live range new start is touching moved range end', () => {
				let moveSource = new Position( root, [ 0, 1, 0 ] );
				let moveRange = new Range( new Position( root, [ 0, 1 ] ), new Position( root, [ 0, 6 ] ) );

				let changes = {
					range: moveRange,
					sourcePosition: moveSource
				};
				doc.fire( 'change', 'move', changes, null );

				expect( live.start.path ).to.deep.equal( [ 0, 5 ] );
				expect( live.end.path ).to.deep.equal( [ 0, 7, 2 ] );
			} );

			it( 'intersects on live range right side and live range new end is touching moved range start', () => {
				live.end.offset = 12;

				let moveSource = new Position( root, [ 0, 2, 10 ] );
				let moveRange = new Range( new Position( root, [ 0, 3, 0 ] ), new Position( root, [ 0, 3, 5 ] ) );

				let changes = {
					range: moveRange,
					sourcePosition: moveSource
				};
				doc.fire( 'change', 'move', changes, null );

				expect( live.start.path ).to.deep.equal( [ 0, 1, 4 ] );
				expect( live.end.path ).to.deep.equal( [ 0, 3, 2 ] );
			} );

			it( 'is equal to live range', () => {
				live.end.path = [ 0, 1, 7 ];

				let moveSource = new Position( root, [ 0, 1, 4 ] );
				let moveRange = new Range( new Position( root, [ 0, 3, 0 ] ), new Position( root, [ 0, 3, 3 ] ) );

				let changes = {
					range: moveRange,
					sourcePosition: moveSource
				};
				doc.fire( 'change', 'move', changes, null );

				expect( live.start.path ).to.deep.equal( [ 0, 3, 0 ] );
				expect( live.end.path ).to.deep.equal( [ 0, 3, 3 ] );
			} );

			it( 'contains live range', () => {
				live.end.path = [ 0, 1, 7 ];

				let moveSource = new Position( root, [ 0, 1, 3 ] );
				let moveRange = new Range( new Position( root, [ 0, 3, 0 ] ), new Position( root, [ 0, 3, 9 ] ) );

				let changes = {
					range: moveRange,
					sourcePosition: moveSource
				};
				doc.fire( 'change', 'move', changes, null );

				expect( live.start.path ).to.deep.equal( [ 0, 3, 1 ] );
				expect( live.end.path ).to.deep.equal( [ 0, 3, 4 ] );
			} );
		} );
	} );

	describe( 'should not get transformed if', () => {
		let otherRoot;

		before( () => {
			otherRoot = doc.createRoot( 'otherRoot' );
		} );

		let live, clone;

		beforeEach( () => {
			live = new LiveRange( new Position( root, [ 0, 1, 4 ] ), new Position( root, [ 0, 2, 2 ] ) );
			clone = Range.createFromRange( live );
		} );

		afterEach( () => {
			live.detach();
		} );

		describe( 'insertion', () => {
			// Technically range will be expanded but the boundaries properties will stay the same.
			// Start won't change because insertion is after it.
			// End won't change because it is in different node.
			it( 'is in the same parent as range start and after it', () => {
				let insertRange = new Range( new Position( root, [ 0, 1, 7 ] ), new Position( root, [ 0, 1, 9 ] ) );

				doc.fire( 'change', 'insert', { range: insertRange }, null );

				expect( live.isEqual( clone ) ).to.be.true;
			} );

			it( 'is in the same parent as range end and after it', () => {
				let insertRange = new Range( new Position( root, [ 0, 2, 7 ] ), new Position( root, [ 0, 2, 9 ] ) );

				doc.fire( 'change', 'insert', { range: insertRange }, null );

				expect( live.isEqual( clone ) ).to.be.true;
			} );

			it( 'is to a position after a node from range end path', () => {
				let insertRange = new Range( new Position( root, [ 3 ] ), new Position( root, [ 4 ] ) );

				doc.fire( 'change', 'insert', { range: insertRange }, null );

				expect( live.isEqual( clone ) ).to.be.true;
			} );

			it( 'is in different root', () => {
				let insertRange = new Range( new Position( otherRoot, [ 0, 0 ] ), new Position( otherRoot, [ 0, 2 ] ) );

				doc.fire( 'change', 'insert', { range: insertRange }, null );

				expect( live.isEqual( clone ) ).to.be.true;
			} );
		} );

		describe( 'range move', () => {
			// Technically range will be expanded but the boundaries properties will stay the same.
			// Start won't change because insertion is after it.
			// End won't change because it is in different node.
			it( 'is to the same parent as range start and after it', () => {
				let moveSource = new Position( root, [ 4 ] );
				let moveRange = new Range( new Position( root, [ 0, 1, 7 ] ), new Position( root, [ 0, 1, 9 ] ) );

				let changes = {
					range: moveRange,
					sourcePosition: moveSource
				};
				doc.fire( 'change', 'move', changes, null );

				expect( live.isEqual( clone ) ).to.be.true;
			} );

			it( 'is to the same parent as range end and before it', () => {
				let moveSource = new Position( root, [ 4 ] );
				let moveRange = new Range( new Position( root, [ 0, 2, 3 ] ), new Position( root, [ 0, 2, 5 ] ) );

				let changes = {
					range: moveRange,
					sourcePosition: moveSource
				};
				doc.fire( 'change', 'move', changes, null );

				expect( live.isEqual( clone ) ).to.be.true;
			} );

			it( 'is to a position after a node from range end path', () => {
				let moveSource = new Position( root, [ 4 ] );
				let moveRange = new Range( new Position( root, [ 0, 3 ] ), new Position( root, [ 0, 5 ] ) );

				let changes = {
					range: moveRange,
					sourcePosition: moveSource
				};
				doc.fire( 'change', 'move', changes, null );

				expect( live.isEqual( clone ) ).to.be.true;
			} );

			// Technically range will be shrunk but the boundaries properties will stay the same.
			// Start won't change because deletion is after it.
			// End won't change because it is in different node.
			it( 'is from the same parent as range start and after it', () => {
				let moveSource = new Position( root, [ 0, 1, 6 ] );
				let moveRange = new Range( new Position( root, [ 4, 0 ] ), new Position( root, [ 4, 3 ] ) );

				let changes = {
					range: moveRange,
					sourcePosition: moveSource
				};
				doc.fire( 'change', 'move', changes, null );

				expect( live.isEqual( clone ) ).to.be.true;
			} );

			it( 'is from the same parent as range end and after it', () => {
				let moveSource = new Position( root, [ 0, 2, 4 ] );
				let moveRange = new Range( new Position( root, [ 4, 0 ] ), new Position( root, [ 4, 2 ] ) );

				let changes = {
					range: moveRange,
					sourcePosition: moveSource
				};
				doc.fire( 'change', 'move', changes, null );

				expect( live.isEqual( clone ) ).to.be.true;
			} );

			it( 'is from a position after a node from range end path', () => {
				let moveSource = new Position( root, [ 0, 3 ] );
				let moveRange = new Range( new Position( root, [ 5, 0 ] ), new Position( root, [ 5, 1 ] ) );

				let changes = {
					range: moveRange,
					sourcePosition: moveSource
				};
				doc.fire( 'change', 'move', changes, null );

				expect( live.isEqual( clone ) ).to.be.true;
			} );

			it( 'is to different root', () => {
				let moveSource = new Position( root, [ 2 ] );
				let moveRange = new Range( new Position( otherRoot, [ 0, 1, 0 ] ), new Position( otherRoot, [ 0, 1, 4 ] ) );

				let changes = {
					range: moveRange,
					sourcePosition: moveSource
				};
				doc.fire( 'change', 'move', changes, null );

				expect( live.isEqual( clone ) ).to.be.true;
			} );

			it( 'is from different root', () => {
				let moveSource = new Position( otherRoot, [ 0, 2, 0 ] );
				let moveRange = new Range( new Position( root, [ 2, 0 ] ), new Position( root, [ 2, 2 ] ) );

				let changes = {
					range: moveRange,
					sourcePosition: moveSource
				};
				doc.fire( 'change', 'move', changes, null );

				expect( live.isEqual( clone ) ).to.be.true;
			} );
		} );
	} );
} );