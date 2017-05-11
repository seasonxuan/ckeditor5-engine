/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals document */

import DomConverter from '../../../src/view/domconverter';
import ViewEditable from '../../../src/view/editableelement';
import ViewDocument from '../../../src/view/document';
import { BR_FILLER, NBSP_FILLER } from '../../../src/view/filler';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';

import global from '@ckeditor/ckeditor5-utils/src/dom/global';
import env from '@ckeditor/ckeditor5-utils/src/env';

testUtils.createSinonSandbox();

describe( 'DomConverter', () => {
	let converter;

	beforeEach( () => {
		converter = new DomConverter();
	} );

	describe( 'constructor()', () => {
		it( 'should create converter with BR block filler by default', () => {
			expect( converter.blockFiller ).to.equal( BR_FILLER );
		} );

		it( 'should create converter with defined block filler', () => {
			converter = new DomConverter( { blockFiller: NBSP_FILLER } );
			expect( converter.blockFiller ).to.equal( NBSP_FILLER );
		} );
	} );

	describe( 'focus()', () => {
		let viewEditable, domEditable, viewDocument;

		beforeEach( () => {
			viewDocument = new ViewDocument();
			viewEditable = new ViewEditable( 'div' );
			viewEditable.document = viewDocument;

			domEditable = document.createElement( 'div' );
			converter.bindElements( domEditable, viewEditable );
			domEditable.setAttribute( 'contenteditable', 'true' );
			document.body.appendChild( domEditable );
		} );

		afterEach( () => {
			document.body.removeChild( domEditable );
			viewDocument.destroy();
		} );

		it( 'should call focus on corresponding DOM editable', () => {
			const focusSpy = testUtils.sinon.spy( domEditable, 'focus' );

			converter.focus( viewEditable );

			expect( focusSpy.calledOnce ).to.be.true;
		} );

		it( 'should not focus already focused editable', () => {
			const focusSpy = testUtils.sinon.spy( domEditable, 'focus' );

			converter.focus( viewEditable );
			converter.focus( viewEditable );

			expect( focusSpy.calledOnce ).to.be.true;
		} );

		// https://github.com/ckeditor/ckeditor5-engine/issues/951
		it( 'should actively prevent window scroll in WebKit', () => {
			const spy = testUtils.sinon.stub( global.window, 'scrollTo' );
			const initialEnvWebkit = env.webkit;

			env.webkit = true;

			global.window.scrollX = 10;
			global.window.scrollY = 100;

			converter.focus( viewEditable );
			sinon.assert.calledWithExactly( spy, 10, 100 );

			env.webkit = false;

			converter.focus( viewEditable );
			sinon.assert.calledOnce( spy );

			env.webkit = initialEnvWebkit;
		} );
	} );

	describe( 'DOM nodes type checking', () => {
		let text, element, documentFragment, comment;

		before( () => {
			text = document.createTextNode( 'test' );
			element = document.createElement( 'div' );
			documentFragment = document.createDocumentFragment();
			comment = document.createComment( 'a' );
		} );

		describe( 'isText()', () => {
			it( 'should return true for Text nodes', () => {
				expect( converter.isText( text ) ).to.be.true;
			} );

			it( 'should return false for other arguments', () => {
				expect( converter.isText( element ) ).to.be.false;
				expect( converter.isText( documentFragment ) ).to.be.false;
				expect( converter.isText( comment ) ).to.be.false;
				expect( converter.isText( {} ) ).to.be.false;
			} );
		} );

		describe( 'isElement()', () => {
			it( 'should return true for HTMLElement nodes', () => {
				expect( converter.isElement( element ) ).to.be.true;
			} );

			it( 'should return false for other arguments', () => {
				expect( converter.isElement( text ) ).to.be.false;
				expect( converter.isElement( documentFragment ) ).to.be.false;
				expect( converter.isElement( comment ) ).to.be.false;
				expect( converter.isElement( {} ) ).to.be.false;
			} );
		} );

		describe( 'isDocumentFragment()', () => {
			it( 'should return true for HTMLElement nodes', () => {
				expect( converter.isDocumentFragment( documentFragment ) ).to.be.true;
			} );

			it( 'should return false for other arguments', () => {
				expect( converter.isDocumentFragment( text ) ).to.be.false;
				expect( converter.isDocumentFragment( element ) ).to.be.false;
				expect( converter.isDocumentFragment( comment ) ).to.be.false;
				expect( converter.isDocumentFragment( {} ) ).to.be.false;
			} );
		} );

		describe( 'isComment()', () => {
			it( 'should return true for HTML comments', () => {
				expect( converter.isComment( comment ) ).to.be.true;
			} );

			it( 'should return false for other arguments', () => {
				expect( converter.isComment( text ) ).to.be.false;
				expect( converter.isComment( element ) ).to.be.false;
				expect( converter.isComment( documentFragment ) ).to.be.false;
				expect( converter.isComment( {} ) ).to.be.false;
			} );
		} );
	} );
} );
