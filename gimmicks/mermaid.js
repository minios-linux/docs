// gimmicks/mermaid.js

(function ($) {
    'use strict';

    var mermaidGimmick = {
        name: 'mermaid',
        version: '1.0.0-final',

        load: function () {
            // Subscribe to the 'gimmick' stage.
            // This is critical to run BEFORE or AT THE SAME TIME as other gimmicks.
            $.md.stage('gimmick').subscribe(function (done) {
                
                // Find ANY code block where the class CONTAINS the word "mermaid".
                // This will catch both 'lang-mermaid' and 'language-mermaid'. This is the most reliable way.
                var mermaidBlocks = $('pre code[class*="mermaid"]');

                if (mermaidBlocks.length === 0) {
                    done(); // Nothing found, exit
                    return;
                }
                
                console.log('Mermaid Gimmick: Found blocks to process: ' + mermaidBlocks.length);

                mermaidBlocks.each(function () {
                    var $code = $(this);
                    var $pre = $code.parent('pre');
                    
                    // Get CLEAN text, even if Prism has already added its tags
                    var diagramText = $code.text();

                    // Create our div for Mermaid
                    var $mermaidContainer = $('<div class="mermaid"></div>').text(diagramText);

                    // Important: Add the 'no-highlight' class to the parent <pre>.
                    // This is an extra instruction for Prism to definitely ignore this block.
                    $pre.addClass('no-highlight');
                    
                    // Replace the code block with our container.
                    // Now Prism will definitely not touch it.
                    $pre.replaceWith($mermaidContainer);
                });
                
                // Initialize Mermaid.
                try {
                    // Important: startOnLoad must be true so it finds new divs automatically
                    mermaid.initialize({
                        startOnLoad: true,
                        theme: 'neutral'
                    });
                    // This call will find all .mermaid and render them.
                    mermaid.init(undefined, '.mermaid');
                } catch (e) {
                    console.error("Mermaid initialization error: ", e);
                }

                // Notify MDwiki that we are done
                done();
            });
        }
    };

    // Register our gimmick
    $.md.registerGimmick(mermaidGimmick);

})(jQuery);