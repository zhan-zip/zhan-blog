---
title: 13-leetcode第[6]期-移除链表元素
published: 2026-09-09
description: 无
category: leetcode
tags: [力扣, 算法]
---

# 本期话题——移除链表元素

终于算是打完数组部分啦！补充的数组题就暂时不讲了，我们进入链表部分吧！今天讲链表部分的移除链表元素。

关于链表的基础知识可以看代码随想录的这里->[关于链表，你该了解这些！](https://programmercarl.com/algo/linked-list/linked-list-basics.html)

阅前注意：

* 此系列以代码随想录为基础，仅是记录个人认为需要补充的部分。

* 此篇内容仅供学习参考。

* 个人编写，有不同的观点欢迎交流。

***

# 链表如何移除元素

看完基础知识，我们应该已经清楚链表大概是怎样一个形式。下面为了方便理解，我们补充一些问题。

对于代码随想录中提到的“头结点”，也就是`第一个拥有实际内容的节点`，我们将其称为“`首元节点`”，而将“`头结点`”这个称呼理解为`首元节点前的一个没有实际内容、只有指针域的节点`，用于指向首元节点。

这样我们在删除一个链表元素时，不论是删除“头结点”还是其他节点，都可以使用`同一种方法`来删除——即将该节点的`前一个节点的指针`指向该节点的`下一个节点`。

# 题目

给你一个链表的头节点 `head` 和一个整数 `val` ，请你删除链表中所有满足 `Node.val == val` 的节点，并返回 **新的头节点** 。

![](https://assets.leetcode.com/uploads/2021/03/06/removelinked-list.jpg)

**示例 1：**

```
输入：head = [1,2,6,3,4,5,6], val = 6
输出：[1,2,3,4,5]

```

**示例 2：**

```
输入：head = [], val = 1
输出：[]

```

**示例 3：**

```
输入：head = [7,7,7,7], val = 7
输出：[]
```

***

# 分析题目

我们打开力扣，可以看到这题给出的开头是这样的（java版）——

```
/**
 * Definition for singly-linked list.
 * public class ListNode {
 *     int val;
 *     ListNode next;
 *     ListNode() {}
 *     ListNode(int val) { this.val = val; }
 *     ListNode(int val, ListNode next) { this.val = val; this.next = next; }
 * }
 */
class Solution {
    public ListNode removeElements(ListNode head, int val) {
    
	}
}
```

不论什么语言，我们拿到了一个`首元节点`，一个`目标值`……

以及力扣帮我们定义好的`链表`，其中包括节点的`数据域val`，`指针next`，以及三个`构造函数`，用于方便我们定义链表节点。

根据刚刚说的头结点的思路，我们可以先定义一个头结点，之后把每一个节点都按正常思路判断、移除，最后返回头结点的下一个节点，也就是最后的首元节点即可。

具体实现看下文。

***

# 解题

首先我们需要一个`虚拟的头结点`用于解题，将其命名为`dummy（虚拟）`，并让其`指向当前的首元节点`。

那么在移除的过程中，我们肯定需要判断当前节点的数据域与题目给出的目标值是否相同，那么我们还需要一个`当前节点`用于判断，将其命名为`current（当前的）`，让其`初始`指向`虚拟的头结点`，在后面每一次判断和操作后进行`更新`。

拥有了这两个节点后，我们就可以开始判断了。

初始的current节点在虚拟头结点上，我们判断它的`下一个节点的数据域`与`目标值`是否相同。

如果相同，我们应该执行`移除`操作，具体如何移除呢？本质上就是`改变current节点的指向`。让其原本指向`current.next`，改为指向`current.next.next`，这样就相当于`把current.next删掉无视`了。

顺带一提，如果是C/C++的话记得手动删除内存。

如果不相同，那我们应该继续向下一个节点移动，`往下判断`，所以让`current`指向`current.next`即可。

因为这个过程肯定不是一次性的，我们需要一个`循环`，循环结束的条件应该是指向了链表的`最后一个节点`，而此时最后一个节点的`下一个节点是空`，所以我们的判断条件应该写为……`当前节点指向的下一个节点不为空`。

思路还是很好懂的，java版代码如下——

```
/**
 * Definition for singly-linked list.
 * public class ListNode {
 *     int val;
 *     ListNode next;
 *     ListNode() {}
 *     ListNode(int val) { this.val = val; }
 *     ListNode(int val, ListNode next) { this.val = val; this.next = next; }
 * }
 */
class Solution {
    public ListNode removeElements(ListNode head, int val) {
        ListNode dummy = new ListNode();
        dummy.next = head;
        ListNode current = dummy;
        while(current.next != null) {
            if(current.next.val == val) {
                current.next = current.next.next;
            } else {
                current = current.next;
            }
        }
        return dummy.next;
    }
}
```

***

# 结语

那么本期移除链表元素的内容就讲到这里啦，力扣链接附在这里[203. 移除链表元素](https://leetcode.cn/problems/remove-linked-list-elements/)，我们下期再见^q^
