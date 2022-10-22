---
template: overrides/main.html
---

# c++并行编程速成

> 本文转载自上海交通大学RoboMaster交龙战队博客仓库，该仓库采用MIT License，原文链接为 [https://sjtu-robomaster-team.github.io/c++-thread/](https://sjtu-robomaster-team.github.io/c++-thread/) 本文转载目的为学术用途。

------------------------

**写在最前面：本教程旨在迅速讲解并行式编程的c++实现方法，适用对象为并不了解并行式编程但急需使用的学习者。本教程中并不会详细的讲述并行式编程的概念、原理，只使用少量篇幅讲述c++并行编程的实现方法。*因此建议有充足时间的学习者系统地学习c++多线程的基本知识，而非阅读本速成教程***

-------------------------


## 为什么需要并行式编程
当前为了提高计算机的性能，许多计算机都装备了双核、四核甚至多个多核处理器，这能让计算机同时执行多个线程。
有些操作可以受益于多线程。例如在查找数组元素时，考虑到数组的随机存取特征，可让一个线程从数组开头开始搜索，并让另一个线程从数组中间开始搜索，这将让搜索时间减半。
## c++11中的多线程支持
c++定义了一个支持线程化执行的内存模型，添加了关键字``thread_local``，提供了相关的库支持。
库支持由原子操作库和线程支持库组成，其中原子操作库提供了头文件``atomic``，而线程支持库提供了头文件``thread``，``mutex``，``condition_variable``，``future``。
**本文将简单介绍``thread``，``mutex``，``condition_variable``的使用**。
如果你想要得到更详细的内容，可以百度搜索这些库。

## 第一部分：thread类
``c++``头文件``<thread>``主要包含了``std::thread``类，此外，命名空间``std::this_thread``也封装在这一头文件中。
##### 构造
``thread``类的构造函数为``thread (Fn&& fn, Args&&... args);``，你可以使用这一构造函数创建一个线程，线程会调用``fn``函数，如果函数``fn``有需要传递的参数，你需要在``args``里给出。
需要注意的是，**构造函数结束的同时函数``fn``将被调用**。
##### 方法
* ``join``方法：
    * 声明：``void join();``
    * 只有当这个线程结束并返回后主线程才会继续执行。
* ``detach``方法：
    * 声明：``void detach();``
    * 把这个线程与主线程分离运行。

下面给出一个例程：
```cpp
#include <iostream>
#include <thread>

int main()
{
    std::ios::sync_with_stdio(false);
    std::thread thread_a([]()
    {
        for (int i = 0; i < 100000; i++)
            std::cout << "thread a: " << i << std::endl;
    });
    std::thread thread_b([]()
    {
        for (int i = 0; i < 100000; i++)
            std::cout << "thread b: " << i << std::endl;
    });
    thread_a.detach();
    thread_b.detach();
    std::this_thread::sleep_for(std::chrono::seconds(1));
    return 0;
}
```
以下是程序中的部分输出：
```
thread a: 61856
thread b: 60031
thread a: 61857
thread b: 60032
thread a: 61858
thread b: 60033
thread a: 61859
thread b: 60034
thread a: 61860
```
可以看到``thread_a``和``thread_b``两个线程在同时向命令行输出信息。

## 第二部分：mutex类

**多线程很方便，许多任务都可以通过并行式运算加快计算速度，但是同时也带来了一些问题，例如当多个线程同时竞争一个内存区域时，就会产生线程安全问题，导致程序运行出现一些意想不到的问题。**

我们运行一下以下代码：
```cpp
#include <iostream>
#include <thread>

int num = 0;

int main()
{
    std::ios::sync_with_stdio(false);
    std::thread thread_a([&]()
    {
        for (int i = 0; i < 100000; i++)
            num++;
    });
    std::thread thread_b([&]()
    {
        for (int i = 0; i < 100000; i++)
            num++;
    });
    thread_a.join();
    thread_b.join();
    std::cout << "result: " << num << std::endl;
    return 0;
}
```
按照我们的理解，两个线程同时运行，一共将变量``num``自增了``200000``次，因此输出结果应该为：
```
result: 200000
```
然而如果你运行一次此程序，你会发现运行结果并非如此。
例如笔者的一次运行结果为：
```
result: 157186
```
你也可以试着运行一次此程序，虽然运行结果可能不是``157186``，但也大概率不是``200000``。

**这样的现象就是多个进程同时竞争一个内存资源导致的。**

为了解决这种问题，我们引入了一种工具——``锁``。所谓``锁``，顾名思义，是用来保护内存的工具，在多线程开发中，必须合理地使用锁才能保证程序的安全。

在``c++11``中提供了``mutex（互斥类）``，它们封装在头文件``<mutex>``中。通过``mutex``可以比较方便的在多线程中使用``锁``。下面先介绍``mutex``类。

##### 构造
``mutex``的构造不需要传递参数，直接``std::mutex mtx``即可。

##### 方法
* ``lock()``方法
    * 如果``mutex``现在没有被任何线程在占有，那么调用``mtx.lock()``函数可以锁住``mutex``，即``mutex``被调用``mtx.lock``的线程占有。
    * 如果``mutex``已经被其他线程占有，那么调用``mtx.lock()``函数的线程将会被阻滞，直到``mutex``被占有它的进程释放（执行``mtx.unlock()``）且本线程成功锁住``mutex``，线程才会恢复运行。
    * 如果在``mutex``已经被本线程锁定的情况下执行``mtx.lock()``函数，那么将会造成**死锁**。由于本教程为速成教程，故不在此解释死锁概念和其解决方法。但死锁概念在多线程编程中十分重要，建议读者百度自学。在此，你可以将``死锁``理解为一把会将进程彻底锁死的锁，产生``死锁``后线程将被阻滞且不会被唤醒。
* ``unlock()``方法
    * 解锁本线程锁定的``mutex``，以便其他线程可以占有``mutex``

下面使用``mutex``解决我们在上一个程序中多线程竞争内存导致的错误：
```cpp
#include <iostream>
#include <thread>
#include <mutex>

int num = 0;
std::mutex mtx;

int main()
{
    std::ios::sync_with_stdio(false);
    std::thread thread_a([&]()
    {
        for (int i = 0; i < 100000; i++)
        {
            mtx.lock();
            num++;
            mtx.unlock();
        }
    });
    std::thread thread_b([&]()
    {
        for (int i = 0; i < 100000; i++)
        {
            mtx.lock();
            num++;
            mtx.unlock();
        }

    });
    thread_a.join();
    thread_b.join();
    std::cout << "result: " << num << std::endl;
    return 0;
}
```

你可以运行这一段程序，如我们所想，程序的输出变成了正确的结果：
```
result: 200000
```

``mutex``已经十分方便了，但是``c++11``还提供了更方便的工具``unique_lock``，他和``mutex``一样封装在``<mutex>``头文件下，下面将介绍``unique_lock``。

##### 构造
``unique_lock``类较简单的构造方法为使用``mutex``进行构造，构造函数为``unique_lock (mutex_type& m);``。
e.g.：
```cpp
unique_lock lock(mtx);
```
``unique_lock``在构造时会自动获取``mutex``，如果无法锁住``mutex``，则此线程会停滞，直到成功获取``mutex``。
在``unique_lock``被析构时，他会自动``unlock``自己获取的``mutex``。这使得他在许多地方非常方便实用。

下面将用``unique_lock``实现上一段代码中``mutex``同样的效果。
```cpp
#include <iostream>
#include <thread>
#include <mutex>

int num = 0;
std::mutex mtx;

int main()
{
    std::ios::sync_with_stdio(false);
    std::thread thread_a([&]()
    {
        for (int i = 0; i < 100000; i++)
        {
            std::unique_lock<std::mutex> lock(mtx);
            num++;
        }
    });
    std::thread thread_b([&]()
    {
        for (int i = 0; i < 100000; i++)
        {
            std::unique_lock<std::mutex> lock(mtx);
            num++;
        }

    });
    thread_a.join();
    thread_b.join();
    std::cout << "result: " << num << std::endl;
    return 0;
}
```
这段程序也可以得到正确的输出结果。

同时，``unique_lock``还有一个很方便的方法：``try_lock()``，这个函数会尝试锁住当前线程并返回一个``bool``值表示是否成功锁住，但不论是否成功锁住当前线程，当前线程都会继续运行。

## 第三部分：condition_variable

``condition_variable``库提供了方便的与条件变量相关的类和函数，他封装在头文件``<condition_variable>``下。下面介绍``condition_variable``类。

##### 构造
``condition_variable``类有默认构造函数，可以直接构造，不需要传递参数。
e.g.：
```cpp
std::condition_variable cv;
```
##### 方法
* ``wait(unique_lock<mutex>& lck, Predicate pred)``方法
    * ``wait``方法传入的两个参数分别为``unique_lock``和一个返回值为``bool``的函数
    * 如果``pred``函数返回值为真，线程会正常运行，否则线程会被阻滞。
    * 在调用``wait``函数的同时，``lck.unlock()``会被自动调用，以保证其他线程正常运行。
    * 当函数``notified_all()``被调用时，如果函数``pred``为真，线程会恢复运行。
* ``notified_all()``方法
    * ``notified_all``将试图唤醒所有被此``condition_variable``阻滞的线程，只有在线程``wait``函数的返回值为真的情况下程序会恢复运行
    
下面是一个例子：
```cpp
#include <iostream>
#include <thread>
#include <mutex>
#include <condition_variable>

std::mutex mtx;
std::condition_variable cv;

bool flag = false;

int main()
{
    std::ios::sync_with_stdio(false);
    std::thread thread_a([]()
    {
        std::unique_lock<std::mutex> lock(mtx);
        cv.wait(lock, [=](){return flag;});
        lock.unlock();
        for (int i = 0; i < 100; i++)
            std::cerr << "thread a once\n";
    });
    std::thread thread_b([]()
    {
        std::unique_lock<std::mutex> lock(mtx);
        cv.wait(lock, [=](){return flag;});
        lock.unlock();
        for (int i = 0; i < 100; i++)
            std::cerr << "thread b once\n";
    });
    thread_a.detach();
    thread_b.detach();
    mtx.lock();
    for (int i = 0; i < 10; i++)
        std::cout << "thread main: " << i << std::endl;
    flag = true;
    mtx.unlock();
    cv.notify_all();
    std::this_thread::sleep_for(std::chrono::seconds(5));
    return 0;
}
```

通过``condition_variable``的延迟使得主线程中的内容先输出后子线程的内容才输出。

