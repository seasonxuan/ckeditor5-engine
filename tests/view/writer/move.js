/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: view, browser-only */

import { move } from '/ckeditor5/engine/view/writer.js';
import { stringify, parse } from '/tests/engine/_utils/view.js';

describe( 'writer', () => {
	/**
	 * Executes test using `parse` and `stringify` utils functions. Uses range delimiters `[]{}` to create and
	 * test ranges.
	 *
	 * @param {String} input
	 * @param {String} expectedResult
	 * @param {String} expectedRemoved
	 */
	function test( source, destination, sourceAfterMove, destinationAfterMove ) {
		let { view: srcView, selection: srcSelection } = parse( source );
		let { view: dstView, selection: dstSelection } = parse( destination );

		const newRange = move( srcSelection.getFirstRange(), dstSelection.getFirstPosition() );

		expect( stringify( dstView, newRange, { showType: true, showPriority: true } ) ).to.equal( destinationAfterMove );
		expect( stringify( srcView, null, { showType: true, showPriority: true } ) ).to.equal( sourceAfterMove );
	}

	describe( 'move', () => {
		it( 'should move single text node', () => {
			test(
				'<container:p>[foobar]</container:p>',
				'<container:p>[]</container:p>',
				'<container:p></container:p>',
				'<container:p>[foobar]</container:p>'
			);
		} );

		it( 'should not leave empty text nodes', () => {
			test(
				'<container:p>{foobar}</container:p>',
				'<container:p>[]</container:p>',
				'<container:p></container:p>',
				'<container:p>[foobar]</container:p>'
			);
		} );

		it( 'should move part of the text node', () => {
			test(
				'<container:p>f{oob}ar</container:p>',
				'<container:p>[]</container:p>',
				'<container:p>far</container:p>',
				'<container:p>[oob]</container:p>'
			);
		} );

		it( 'should support unicode', () => {
			test(
				'<container:p>நி{லை}க்கு</container:p>',
				'<container:p>நி{}கு</container:p>',
				'<container:p>நிக்கு</container:p>',
				'<container:p>நி{லை}கு</container:p>'
			);
		} );

		it( 'should move parts of nodes', () => {
			test(
				'<container:p>f{oo<attribute:b:10>ba}r</attribute:b:10></container:p>',
				'<container:p>[]<attribute:b:10>qux</attribute:b:10></container:p>',
				'<container:p>f<attribute:b:10>r</attribute:b:10></container:p>',
				'<container:p>[oo<attribute:b:10>ba}qux</attribute:b:10></container:p>'
			);
		} );

		it( 'should merge after moving #1', () => {
			test(
				'<container:p><attribute:b:1>foo</attribute:b:1>[bar]<attribute:b:1>bazqux</attribute:b:1></container:p>',
				'<container:p><attribute:b:1>foo{}bazqux</attribute:b:1></container:p>',
				'<container:p><attribute:b:1>foobazqux</attribute:b:1></container:p>',
				'<container:p><attribute:b:1>foo</attribute:b:1>[bar]<attribute:b:1>bazqux</attribute:b:1></container:p>'
			);
		} );

		it( 'should merge after moving #2', () => {
			test(
				'<container:p><attribute:b:1>fo{o</attribute:b:1>bar<attribute:b:1>ba}zqux</attribute:b:1></container:p>',
				'<container:p><attribute:b:1>fo{}zqux</attribute:b:1></container:p>',
				'<container:p><attribute:b:1>fozqux</attribute:b:1></container:p>',
				'<container:p><attribute:b:1>fo{o</attribute:b:1>bar<attribute:b:1>ba}zqux</attribute:b:1></container:p>'
			);
		} );

		it( 'should move part of the text node in document fragment', () => {
			test( 'fo{ob}ar', 'fo{}ar', 'foar', 'fo{ob}ar' );
		} );
	} );
} );