asynctest(
  'WaiterTest',
 
  [
    'ephox.agar.api.Pipeline',
    'ephox.agar.api.Step',
    'ephox.agar.api.Waiter',
    'ephox.agar.test.StepAssertions',
    'global!setTimeout'
  ],
 
  function (Pipeline, Step, Waiter, StepAssertions, setTimeout) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    var makeTryUntilStep = function (label, interval, amount) {
      var counter = 0;
      return Waiter.sTryUntil(
        label + ': TryUntil counter',
        Step.stateful(function (_value, next, die) {
          counter++;
          if (counter === 5) return next(counter);
          else die('did not reach number');
        }),
        interval,
        amount
      );
    };

    var makeTryUntilNotStep = function (label, interval, amount) {
      var counter = 0;
      return Waiter.sTryUntilNot(
        label + ': TryUntilNot counter',
        Step.stateful(function (_value, next, die) {
          counter++;
          if (counter < 10) return next('Not yet');
          else die(counter);
        }),
        interval,
        amount
      );
    };

    var makeDelayStep = function (label, timeout, delay) {
      return Waiter.sTimeout(
        label + ': Waiter timeout',
        Step.async(function (next, die) {
          setTimeout(function () {
            next();
          }, delay);
        }), timeout);
    };

    Pipeline.async({}, [
      StepAssertions.passed('tryUntil with enough time', 5, makeTryUntilStep('enough time', 100, 1000)),
      StepAssertions.failed(
        'tryUntil with *NOT* enough time', 
        'Waited for 200ms for something to be successful. not enough time: TryUntil counter\ndid not reach number',
        makeTryUntilStep('not enough time', 100, 200)
      ),

      StepAssertions.passed('tryUntilNot with enough time', StepAssertions.preserved(), makeTryUntilNotStep('enough time', 100, 2000)),
      StepAssertions.failed(
        'tryUntilNot with *NOT* enough time', 
        'Waited for 200ms for something to be unsuccessful. not enough time: TryUntilNot counter',
        makeTryUntilNotStep('not enough time', 100, 200)
      ),

      StepAssertions.passed(
        'timeout with enough time',
        StepAssertions.preserved(), 
        makeDelayStep('enough time', 1000, 200)
      ),

      StepAssertions.failed(
        'timeout with *NOT* enough time',
        'Hit the limit (300) for: not enough time: Waiter timeout', 
        makeDelayStep('not enough time', 300, 2000)
      )


    ], function () { success(); }, failure);
 

  }
);