import "./styles.css";

document.getElementById("app").innerHTML = `
<h1>Hello Vanilla!</h1>
<div>
  We use the same configuration as Parcel to bundle this sandbox, you can find more
  info about Parcel 
  <a href="https://parceljs.org" target="_blank" rel="noopener noreferrer">here</a>.
</div>
`;

//promise
function asyncFunction() {
  //Promiseオブジェクトを返す、処理成功時にはresolveが呼ばれる
  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      //成功
      //resolve("Async Hello world");
      //失敗
      reject(new Error("Error"));
    }, 16);
  });
}

asyncFunction()
  .then(function (value) {
    //非同期処理成功
    console.log(value); // => 'Async Hello world'
  })
  .catch(function (error) {
    //非同期処理失敗
    console.log(error);
  });

//メソッドチェーン
function taskA() {
  //onRejectedを読んで見る
  //throw new Error("Error");
  console.log("task:A");
}

function taskB() {
  console.log("task:B");
}

function onRejected(error) {
  console.log("error:" + error);
}

var promise = Promise.resolve();
promise.then(taskA).then(taskB).catch(onRejected);

//非同期処理を並列で行う
//Promise.all()
const allTaskA = new Promise((resolve, reject) => {
  setTimeout(function () {
    console.log("taskA");
    resolve();
  }, 16);
});

const allTaskB = new Promise((resolve, reject) => {
  setTimeout(function () {
    console.log("taskB");
    //resolve();
    reject();
  }, 10);
});

const before = new Date();
Promise.all([allTaskA, allTaskB])
  .then(() => {
    const after = new Date();
    const result = after.getTime() - before.getTime();
    console.log(result);
  })
  .catch(() => {
    console.log("error");
  });
//Promiseのいずれかでもエラーになった時点で他のPromiseの処理を待たずに終了させたい場合にはprocess.exit(1)など使えば良さそうですね。

//Promise.race()
//一つでもresolve, rejectが呼び出されたら、thenもしくはcatchが呼びされます。
const raceTaskA = new Promise((resolve, reject) => {
  setTimeout(function () {
    console.log("taskA_race");
    resolve();
  }, 16);
});

const raceTaskB = new Promise((resolve, reject) => {
  setTimeout(function () {
    console.log("taskB_race");
    resolve();
    //rejectはallのときと同様
  }, 1);
});

const before2 = new Date();
Promise.race([raceTaskA, raceTaskB])
  .then(() => {
    const after = new Date();
    const result = after.getTime() - before2.getTime();
    console.log(result);
  })
  .catch(() => {
    console.log("error_race");
  });

//逐次処理（直列処理）
Promise.resolve()
  .then(() => {
    return new Promise((resolve, reject) => {
      setTimeout(function () {
        console.log("taskA_tikuji");
        resolve("taskA_tikuji death");
      }, 16);
    });
  })
  .then((value) => {
    return new Promise((resolve, reject) => {
      setTimeout(function () {
        console.log(value);
        console.log("taskB_tikuji");
        resolve("taskB_tikuji death");
      }, 16);
    });
  })
  .then((value) => {
    console.log("then");
    console.log(value);
  })
  .catch((error) => {
    console.log(error);
  });

//sequenceTasksメソッド
//Promiseでの実行結果がそれぞれpushされるので最終的に後から結果の取得を行うこともできます。
const value = "seq";
const sequenceTasks = (tasks) => {
  const recodeValue = (result, value) => {
    result.push(value);
    return result;
  };
  const pushValue = recodeValue.bind(null, []);
  return tasks.reduce((promise, task) => {
    return promise.then(task).then(pushValue);
  }, Promise.resolve());
};

const promises = {
  doTaskA: () => {
    return seqTaskA().then();
  },
  doTaskB: () => {
    return seqTaskB(value).then();
  }
};

const seqTaskA = () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log("taskA_seq");
      resolve("taskA_seq death");
    }, 16);
  });
};

const seqTaskB = (value) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log(value);
      console.log("taskB_seq");
      resolve("taskB_seq death");
    }, 1);
  });
};

const main = () => {
  return sequenceTasks([promises.doTaskA, promises.doTaskB]);
};

main()
  .then(() => {
    console.log("then_seq");
    console.log(value);
    //taskAもしくはtaskBのエラーの場合に呼び出される
  })
  .catch((error) => {
    console.log(error);
  });
