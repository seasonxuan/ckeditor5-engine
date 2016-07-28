/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: view */

import TextProxy from '/ckeditor5/engine/view/textproxy.js';
import Text from '/ckeditor5/engine/view/text.js';
import ContainerElement from '/ckeditor5/engine/view/containerelement.js';
import DocumentFragment from '/ckeditor5/engine/view/documentfragment.js';
import RootEditableElement from '/ckeditor5/engine/view/rooteditableelement.js';
import CKEditorError from '/ckeditor5/utils/ckeditorerror.js';

import createDocumentMock from '/tests/engine/view/_utils/createdocumentmock.js';

describe( 'TextProxy', () => {
	let text, parent, wrapper, textProxy;

	beforeEach( () => {
		text = new Text( 'abcdefgh' );
		parent = new ContainerElement( 'p', [], [ text ] );
		wrapper = new ContainerElement( 'div', [], parent );

		textProxy = new TextProxy( text, 2, 3 );
	} );

	describe( 'constructor', () => {
		it( 'should create TextProxy instance with specified properties', () => {
			expect( textProxy ).to.have.property( 'parent' ).to.equal( parent );
			expect( textProxy ).to.have.property( 'data' ).to.equal( 'cde' );
			expect( textProxy ).to.have.property( 'textNode' ).to.equal( text );
			expect( textProxy ).to.have.property( 'offsetInText' ).to.equal( 2 );
		} );

		it( 'should have isPartial property', () => {
			let startTextProxy = new TextProxy( text, 0, 4 );
			let fullTextProxy = new TextProxy( text, 0, 8 );

			expect( textProxy.isPartial ).to.be.true;
			expect( startTextProxy.isPartial ).to.be.true;
			expect( fullTextProxy.isPartial ).to.be.false;
		} );

		it( 'should throw if wrong offsetInText is passed', () => {
			expect( () => {
				new TextProxy( text, -1, 2 );
			} ).to.throw( CKEditorError, /view-textproxy-wrong-offsetintext/ );

			expect( () => {
				new TextProxy( text, 9, 1 );
			} ).to.throw( CKEditorError, /view-textproxy-wrong-offsetintext/ );
		} );

		it( 'should throw if wrong length is passed', () => {
			expect( () => {
				new TextProxy( text, 2, -1 );
			} ).to.throw( CKEditorError, /view-textproxy-wrong-length/ );

			expect( () => {
				new TextProxy( text, 2, 9 );
			} ).to.throw( CKEditorError, /view-textproxy-wrong-length/ );
		} );
	} );

	describe( 'getDocument', () => {
		it( 'should return null if any parent has not set Document', () => {
			expect( textProxy.document ).to.be.null;
		} );

		it( 'should return Document attached to the parent element', () => {
			const docMock = createDocumentMock();
			const root = new RootEditableElement( docMock, 'div' );

			wrapper.parent = root;

			expect( textProxy.document ).to.equal( docMock );
		} );

		it( 'should return null if element is inside DocumentFragment', () => {
			new DocumentFragment( [ wrapper ] );

			expect( textProxy.document ).to.be.null;
		} );
	} );

	describe( 'getRoot', () => {
		it( 'should return root element', () => {
			const root = new RootEditableElement( createDocumentMock(), 'div' );

			wrapper.parent = root;

			expect( textProxy.root ).to.equal( root );
		} );
	} );

	describe( 'getAncestors', () => {
		it( 'should return array of ancestors', () => {
			const result = textProxy.getAncestors();

			expect( result ).to.be.an( 'array' );
			expect( result ).to.length( 2 );
			expect( result[ 0 ] ).to.equal( wrapper );
			expect( result[ 1 ] ).to.equal( parent );
		} );

		it( 'should return array of ancestors starting from parent `parentFirst`', () => {
			const result = textProxy.getAncestors( { parentFirst: true } );

			expect( result.length ).to.equal( 2 );
			expect( result[ 0 ] ).to.equal( parent );
			expect( result[ 1 ] ).to.equal( wrapper );
		} );

		it( 'should return array including node itself `includeNode`', () => {
			const result = textProxy.getAncestors( { includeNode: true } );

			expect( result ).to.be.an( 'array' );
			expect( result ).to.length( 3 );
			expect( result[ 0 ] ).to.equal( wrapper );
			expect( result[ 1 ] ).to.equal( parent );
			expect( result[ 2 ] ).to.equal( text );
		} );

		it( 'should return array of ancestors including node itself `includeNode` starting from parent `parentFirst`', () => {
			const result = textProxy.getAncestors( { includeNode: true, parentFirst: true } );

			expect( result.length ).to.equal( 3 );
			expect( result[ 0 ] ).to.equal( text );
			expect( result[ 1 ] ).to.equal( parent );
			expect( result[ 2 ] ).to.equal( wrapper );
		} );
	} );

	describe( 'unicode support', () => {
		it( 'should create correct text proxy instances of text nodes containing special unicode symbols', () => {
			let textHamil = new Text( 'நிலைக்கு' );

			let textProxy02 = new TextProxy( textHamil, 0, 2 ); // Should contain two symbols from original text node.
			let textProxy04 = new TextProxy( textHamil, 0, 4 ); // Whole text node.
			let textProxy12 = new TextProxy( textHamil, 1, 2 );
			let textProxy22 = new TextProxy( textHamil, 2, 2 );
			let textProxy31 = new TextProxy( textHamil, 3, 1 );

			expect( textProxy02.data ).to.equal( 'நிலை' );
			expect( textProxy04.data ).to.equal( 'நிலைக்கு' );
			expect( textProxy12.data ).to.equal( 'லைக்' );
			expect( textProxy22.data ).to.equal( 'க்கு' );
			expect( textProxy31.data ).to.equal( 'கு' );

			expect( textProxy02.size ).to.equal( 2 );
			expect( textProxy04.size ).to.equal( 4 );
			expect( textProxy12.size ).to.equal( 2 );
			expect( textProxy22.size ).to.equal( 2 );
			expect( textProxy31.size ).to.equal( 1 );

			expect( textProxy02.data.length ).to.equal( 4 );
			expect( textProxy04.data.length ).to.equal( 8 );
			expect( textProxy12.data.length ).to.equal( 4 );
			expect( textProxy22.data.length ).to.equal( 4 );
			expect( textProxy31.data.length ).to.equal( 2 );
		} );
	} );
} );