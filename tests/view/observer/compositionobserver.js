/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals document */

import CompositionObserver from '../../../src/view/observer/compositionobserver';
import ViewDocument from '../../../src/view/document';
import ViewRange from '../../../src/view/range';

describe( 'CompositionObserver', () => {
	let viewDocument, observer;

	beforeEach( () => {
		viewDocument = new ViewDocument();
		observer = viewDocument.getObserver( CompositionObserver );
	} );

	afterEach( () => {
		viewDocument.destroy();
	} );

	it( 'should define domEventType', () => {
		expect( observer.domEventType ).to.deep.equal( [ 'compositionstart', 'compositionupdate', 'compositionend' ] );
	} );

	describe( 'onDomEvent', () => {
		it( 'should fire compositionstart with the right event data', () => {
			const spy = sinon.spy();

			viewDocument.on( 'compositionstart', spy );

			observer.onDomEvent( { type: 'compositionstart', target: document.body } );

			expect( spy.calledOnce ).to.be.true;

			const data = spy.args[ 0 ][ 1 ];
			expect( data.domTarget ).to.equal( document.body );
		} );

		it( 'should fire compositionupdate with the right event data', () => {
			const spy = sinon.spy();

			viewDocument.on( 'compositionupdate', spy );

			observer.onDomEvent( { type: 'compositionupdate', target: document.body } );

			expect( spy.calledOnce ).to.be.true;

			const data = spy.args[ 0 ][ 1 ];
			expect( data.domTarget ).to.equal( document.body );
		} );

		it( 'should fire compositionend with the right event data', () => {
			const spy = sinon.spy();

			viewDocument.on( 'compositionend', spy );

			observer.onDomEvent( { type: 'compositionend', target: document.body } );

			expect( spy.calledOnce ).to.be.true;

			const data = spy.args[ 0 ][ 1 ];
			expect( data.domTarget ).to.equal( document.body );
		} );

		it( 'should render document after compositionend', () => {
			const renderSpy = sinon.spy( viewDocument, 'render' );

			observer.onDomEvent( { type: 'compositionend', target: document.body } );

			sinon.assert.calledOnce( renderSpy );
		} );
	} );

	describe( 'handle isComposing property of the document', () => {
		let domMain, domHeader, viewMain, viewHeader;

		beforeEach( () => {
			domMain = document.createElement( 'div' );
			domHeader = document.createElement( 'h1' );

			viewMain = viewDocument.createRoot( domMain );
			viewHeader = viewDocument.createRoot( domHeader, 'header' );
		} );

		it( 'should set isComposing to true on compositionstart', () => {
			observer.onDomEvent( { type: 'compositionstart', target: domMain } );

			expect( viewDocument.isComposing ).to.equal( true );
		} );

		it( 'should set isComposing to false on compositionend', () => {
			observer.onDomEvent( { type: 'compositionstart', target: domMain } );

			expect( viewDocument.isComposing ).to.equal( true );

			observer.onDomEvent( { type: 'compositionend', target: domMain } );

			expect( viewDocument.isComposing ).to.equal( false );
		} );

		it( 'should not change isComposing on compositionupdate during composition', () => {
			observer.onDomEvent( { type: 'compositionstart', target: domMain } );

			expect( viewDocument.isComposing ).to.equal( true );

			observer.onDomEvent( { type: 'compositionupdate', target: domMain } );

			expect( viewDocument.isComposing ).to.equal( true );
		} );

		it( 'should not change isComposing on compositionupdate outside composition', () => {
			expect( viewDocument.isComposing ).to.equal( false );

			observer.onDomEvent( { type: 'compositionupdate', target: domMain } );

			expect( viewDocument.isComposing ).to.equal( false );
		} );
	} );
} );
