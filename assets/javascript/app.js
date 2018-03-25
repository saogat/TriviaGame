function shuffle(array) {
    var currentIndex = array.length,
        temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }
    return array;
}

function startGame() {
    var url = " https://opentdb.com/api.php?amount=10";
    $.ajax({
        url: url,
        method: 'GET',
    }).done(function (response) {
        var centerDiv = $(".centered-div");
        var questionIndex = 0;
        var wins = 0;
        var losses = 0;
        var correctAnswer;
        var maxSeconds = 20;

        var data = function getData() {
            let data = [];
            for (let i = 0; i < response.results.length; i++) {
                let qAndAs = {};
                qAndAs.question = response.results[i].question;
                qAndAs.answers = response.results[i].incorrect_answers;
                qAndAs.correctAnswer = response.results[i].correct_answer;
                qAndAs.answers.push(qAndAs.correctAnswer);
                qAndAs.answers = qAndAs.answers.filter(each => each != undefined);
                shuffle(qAndAs.answers);
                data.push(qAndAs);
            };
            return data;
        }();

        function showData(qAndAs) {
            let questionDiv = $("<div>");
            questionDiv.addClass("question");
            let answerDiv = $("<div>");
            answerDiv.addClass("answer");
            answerDiv.attr("id", "answers");
            let counterDiv = $("<div>");
            let counterNumber = $("<h2>");
            counterDiv.addClass("counter");

            centerDiv.empty();

            // Show question
            questionDiv.append($("<h2>").html(qAndAs.question));
            centerDiv.append(questionDiv);

            //Show Counter
            counterDiv.append(counterNumber);
            centerDiv.append(counterDiv);

            // Show answers
            qAndAs.answers.forEach(function (answer) {
                let buttonDiv = $("<button>");
                buttonDiv.addClass("answerButton");
                answerDiv.append(buttonDiv.attr("data-answer", answer).html(answer));
                centerDiv.append(answerDiv);
                centerDiv.append($("<br>"));
            });
        }

        function showNextData() {
            correctAnswer = data[questionIndex].correctAnswer;
            showData(data[questionIndex]);
        }

        function showSuccess() {
            let answerDiv = $(".answer");
            let h2Div = $("<h2>");
            answerDiv.empty();
            answerDiv.append(answerDiv.append(h2Div.text("Congratulations! That is the correct answer!")));
            delayShow();
            wins++;
        }

        function showFailure() {
            let answerDiv = $(".answer");
            answerDiv.empty();
            answerDiv.append(answerDiv.append($("<h2>").text("Oops! The correct answer is:")));
            answerDiv.append(answerDiv.append($("<h2>").text(correctAnswer)));
            delayShow();
            losses++;
        }

        function showTimeup() {
            let answerDiv = $(".answer");
            answerDiv.empty();
            answerDiv.append(answerDiv.append($("<h2>").text("Time is up! The correct answer is:")));
            answerDiv.append(answerDiv.append($("<h2>").text(correctAnswer)));
            delayShow();
            losses++;
        }

        function delayTimeup() {
            var id = setTimeout(function () {
                showTimeup();
            }, 20000);
            return id;
        }

        function delayShow() {
            var id = setTimeout(function () {
                play();
            }, 2000);
            return id;
        }

        var counter = {
            seconds: maxSeconds,
            intervalId: 0,

            run: function () {
                let self = counter;
                self.stop();
                self.intervalId = setInterval(self.decrement, 1000);
            },

            decrement: function () {
                let self = counter;
                self.seconds--;
                $(".counter").html("<h2>" + "Seconds left:  " + self.seconds + "</h2>");
                if (self.seconds === 0) {
                    self.stop();
                    showTimeup();
                }
            },

            stop: function () {
                let self = counter;
                clearInterval(self.intervalId);
                $(".counter").empty();
                self.seconds = maxSeconds;
            }
        }

        function play() {
            if (questionIndex < 10) {
                showNextData();
                counter.run();
                $(".answerButton").on("click", function (event) {
                    event.preventDefault();
                    counter.stop();
                    if ($(this).attr("data-answer") == correctAnswer) {
                        showSuccess();
                    } else {
                        showFailure();
                    }
                });
            } else {
                showStart()
            };
            questionIndex++;
        }

        function showStart() {
            centerDiv.empty();
            let answerDiv = $("<div>");
            answerDiv.addClass("answer");
            answerDiv.append(answerDiv.append($("<h2>").text("Wins: " + wins)));
            centerDiv.append(answerDiv);
            answerDiv = $("<div>");
            answerDiv.addClass("answer");
            centerDiv.append(answerDiv);
            answerDiv.append(answerDiv.append($("<h2>").text("Losses: " + losses)));
            centerDiv.append(answerDiv);
            var buttonDiv = $("<button>");
            buttonDiv.addClass("btn btn-default start-button");
            buttonDiv.attr("type", "submit");
            buttonDiv.text("START");
            centerDiv.append(buttonDiv);
        }

        play();

    }).fail(function (err) {
        throw err;
    })
};

$(".centered-div").on("click", ".start-button", function (event) {
    event.preventDefault();
    console.log("started");
    startGame();
})