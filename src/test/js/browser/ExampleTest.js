asynctest(
  'Example for Tutorial',

  [
    'ephox.agar.api.Chain',
    'ephox.agar.api.Guard',
    'ephox.agar.api.Mouse',
    'ephox.agar.api.Pipeline',
    'ephox.agar.api.UiFinder',
    'ephox.sugar.api.properties.Class',
    'ephox.sugar.api.properties.Css',
    'ephox.sugar.api.events.DomEvent',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.properties.Html',
    'ephox.sugar.api.dom.Insert',
    'ephox.sugar.api.dom.InsertAll',
    'ephox.sugar.api.dom.Remove',
    'global!document',
    'global!setTimeout'
  ],

  function (Chain, Guard, Mouse, Pipeline, UiFinder, Class, Css, DomEvent, Element, Html, Insert, InsertAll, Remove, document, setTimeout) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    var makeSource = function () {
      var editor = Element.fromTag('div');
      Class.add(editor, 'editor');
      // Css.set(editor, 'display', 'none');

      var showButton = Element.fromTag('button');
      Class.add(showButton, 'show');
      Html.set(showButton, 'Show');

      var dialog = Element.fromTag('div');
      Class.add(dialog, 'dialog');
      Css.setAll(dialog, {
        width: '300px',
        height: '200px',
        border: '1px solid black',
        position: 'absolute',
        left: '100px',
        top: '100px',
        background: 'white'
      });
      var dialogContent = Element.fromTag('textarea');
      Html.set(dialogContent, 'Look at this dialog ... wow!');

      var cancelButton = Element.fromTag('button');
      Html.set(cancelButton, 'Cancel');
      Class.add(cancelButton, 'cancel');

      InsertAll.append(dialog, [ dialogContent, cancelButton ]);

      Insert.append(editor, showButton);

      setTimeout(function () {
        Insert.append(Element.fromDom(document.body), editor);
      }, 1000);

      var onClick = DomEvent.bind(showButton, 'click', function () {
        setTimeout(function () {
          Insert.append(editor, dialog);
        }, 1000);
        onClick.unbind();
      });

      var onCancel = DomEvent.bind(cancelButton, 'click', function () {
        setTimeout(function () {
          Remove.remove(dialog);
        }, 1000);
        onCancel.unbind();
      });

      return editor;
    };

    var source = makeSource();

    var body = Element.fromDom(document.body);

    Pipeline.async({}, [
      // Inject as the first input: body
      Chain.asStep(body, [
        // Input: > container, output: visible element
        UiFinder.cWaitForVisible('Waiting for ".editor" to be visible', '.editor'),
        Mouse.cClickOn('button.show'),
        Chain.inject(body),
        UiFinder.cWaitForVisible('Waiting for ".dialog" to be visible', '.dialog'),
        Mouse.cClickOn('button.cancel'),
        Chain.inject(body),
        Chain.control(
          UiFinder.cFindIn('.dialog'),
          Guard.tryUntilNot('Keep going until .dialog is not in the DOM', 100, 1000)
        )
      ])
    ], function () {
      Remove.remove(source);
      success();      
    }, failure);
  }
);