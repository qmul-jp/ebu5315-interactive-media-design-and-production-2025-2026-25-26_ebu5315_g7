/**
 * questionBank.js
 * 核心几何知识点：圆的定理 (GCSE / Grade 9-10 Level)
 * 包含完整的双语数据支持与防重复随机抽题逻辑
 * 将填空题全部改成选择性填空题
 */

const circleQuestionsData = {
    // Level 1: 4题 (2 拖拽 + 2 选择)
    level1: [
        {
            id: "l1_drag_1",
            type: "drag",
            imageDesc: {
                en: "[Diagrams showing three theorems: Angles in same segment, Angle at center, Angle in semicircle]",
                zh: "[图示三个定理：同弧所对圆周角、圆心角是圆周角的两倍、半圆上的圆周角为90°]"
            },
            question: {
                en: "Match the following circle theorems to their corresponding diagrams.",
                zh: "将下列圆的定理拖拽匹配到对应的图示中。"
            },
            options: [
                { id: "opt1", en: "Angles in same segment", zh: "同弧所对圆周角" },
                { id: "opt2", en: "The central angle is twice the inscribed angle.", zh: "同弧所对圆心角是圆周角的两倍。" },
                { id: "opt3", en: "Semicircle is 90°", zh: "半圆上的圆周角为90°" }
            ],
            answer: { "zone1": "opt1", "zone2": "opt2", "zone3": "opt3" },
            // 🌟 新增这一段：为右侧的拖拽目标框指定图片
            zoneImages: {
                "zone1": "./images/theorem-same-segment.png",
                "zone2": "./images/theorem-center-angle.png",
                "zone3": "./images/theorem-semicircle.png"
            },
            explanation: {
                en: "These are the fundamental circle theorems regarding angles subtended by arcs.",
                zh: "这些是关于弧所对角度的基础圆定理。"
            }
        },
        {
            id: "l1_drag_2",
            type: "drag",
            imageDesc: {
                en: "[Diagram showing a circle with a Radius, Chord, Tangent, and Arc highlighted]",
                zh: "[图示一个圆，高亮标出了半径、弦、切线和圆弧]"
            },
            question: {
                en: "Drag the correct geometric terms to label the parts of the circle.",
                zh: "拖拽正确的几何术语来标记圆的各个部分。"
            },
            options: [
                { id: "opt1", en: "Radius", zh: "半径" },
                { id: "opt2", en: "Chord", zh: "弦" },
                { id: "opt3", en: "Tangent", zh: "切线" }
            ],
            answer: { "zone1": "opt1", "zone2": "opt2", "zone3": "opt3" },
            zoneImages: {
                "zone1": "./images/Radius.png",
                "zone2": "./images/Chord.png",
                "zone3": "./images/Tangent.png"
            },
            explanation: {
                en: "A radius goes from center to edge. A chord links two points on the edge. A tangent touches the circle at exactly one point.",
                zh: "半径从圆心连接到边缘。弦连接圆上的两点。切线与圆仅有一个交点。"
            }
        },
        {
            id: "l1_mcq_1",
            type: "mcq",
            imageSrc: "./images/theorem-semicircle.png",
            imageDesc: {
                en: "[Diagram: A circle with diameter AB. Point C is on the circumference forming triangle ABC.]",
                zh: "[图示：包含直径AB的圆。点C在圆周上，形成三角形ABC。]"
            },
            question: {
                en: "AB is the diameter of a circle. C is a point on the circumference. What is the size of angle ACB?",
                zh: "AB 是圆的直径。C 是圆周上的一点。角 ACB 的大小是多少？"
            },
            options: [
                { id: "A", en: "45°", zh: "45°" },
                { id: "B", en: "90°", zh: "90°" },
                { id: "C", en: "180°", zh: "180°" }
            ],
            answer: "B",
            explanation: {
                en: "The angle subtended by a diameter at the circumference is always a right angle (90°).",
                zh: "直径在圆周上所对的角始终是直角 (90°)。"
            }
        },
        {
            id: "l1_mcq_2",
            type: "mcq",
            imageDesc: {
                en: "[Diagram: Circle with center O. Points A, B, C are on the circumference. Angle AOB at center is 100°.]",
                zh: "[图示：圆心为O。A、B、C在圆周上。圆心角AOB为100°。]"
            },
            question: {
                en: "The angle at the centre, ∠AOB, is 100°. What is the size of the angle at the circumference, ∠ACB?",
                zh: "圆心角 ∠AOB 为 100°。圆周角 ∠ACB 的大小是多少？"
            },
            options: [
                { id: "A", en: "50°", zh: "50°" },
                { id: "B", en: "100°", zh: "100°" },
                { id: "C", en: "200°", zh: "200°" }
            ],
            answer: "A",
            explanation: {
                en: "The angle at the centre is twice the angle at the circumference. So, 100° ÷ 2 = 50°.",
                zh: "同弧所对的圆心角是圆周角的两倍。因此，100° ÷ 2 = 50°。"
            }
        }
    ],

    // Level 2: 4题 (全部变为选择题，其中2道是选择式填空)
    level2: [
        {
            id: "l2_mcq_1",
            type: "mcq",
            imageSrc: "./images/l2_mcq_1.png",
            imageDesc: {
                en: "[Diagram: A cyclic quadrilateral ABCD inscribed in a circle. Angle DAB is 70°.]",
                zh: "[图示：内接于圆的圆内接四边形ABCD。角DAB为70°。]"
            },
            question: {
                en: "ABCD is a cyclic quadrilateral. If ∠DAB = 70°, what is the size of the opposite angle ∠BCD?",
                zh: "ABCD 是一个圆内接四边形。如果 ∠DAB = 70°，其对角 ∠BCD 的大小是多少？"
            },
            options: [
                { id: "A", en: "70°", zh: "70°" },
                { id: "B", en: "110°", zh: "110°" },
                { id: "C", en: "140°", zh: "140°" }
            ],
            answer: "B",
            explanation: {
                en: "Opposite angles in a cyclic quadrilateral add up to 180°. So, 180° - 70° = 110°.",
                zh: "圆内接四边形的对角互补（相加等于180°）。因此，180° - 70° = 110°。"
            }
        },
        {
            id: "l2_mcq_2",
            type: "mcq",
            imageDesc: {
                en: "[Diagram: A circle with a tangent line touching at point T. A radius is drawn to point T.]",
                zh: "[图示：一条切线与圆交于T点。从圆心画出一条半径连接到T点。]"
            },
            question: {
                en: "What is the angle between a tangent to a circle and the radius at the point of contact?",
                zh: "圆的切线与过切点的半径之间的夹角是多少度？"
            },
            options: [
                { id: "A", en: "45°", zh: "45°" },
                { id: "B", en: "90°", zh: "90°" },
                { id: "C", en: "180°", zh: "180°" }
            ],
            answer: "B",
            explanation: {
                en: "A tangent is always perpendicular (90°) to the radius at the point of contact.",
                zh: "切线总是垂直于（90°）经过切点的半径。"
            }
        },
        {
            id: "l2_fib_1", // ID保持不变，防冲突，只修改 type
            type: "mcq",
            imageDesc: {
                en: "[Diagram: A circle with a chord AB. A line from the center is perpendicular to AB, dividing it.]",
                zh: "[图示：包含弦AB的圆。一条从圆心出发垂直于AB的线将弦分割。]"
            },
            question: {
                en: "A perpendicular line drawn from the centre of a circle to a chord will ______ the chord.",
                zh: "从圆心向弦作垂线，该垂线会 ______ 这条弦。"
            },
            options: [
                { id: "A", en: "bisect", zh: "平分" },
                { id: "B", en: "double", zh: "加倍" },
                { id: "C", en: "be parallel to", zh: "平行于" }
            ],
            answer: "A",
            explanation: {
                en: "The perpendicular from the centre to a chord bisects the chord (cuts it exactly in half).",
                zh: "垂径定理：垂直于弦的直径（或从圆心作的垂线）平分这条弦。"
            }
        },
        {
            id: "l2_fib_2",
            type: "mcq",
            imageDesc: {
                en: "[Diagram: Two tangent lines drawn from an external point P, touching the circle at points A and B.]",
                zh: "[图示：从外部点P画出的两条切线，分别与圆交于A、B两点。]"
            },
            question: {
                en: "Two tangents drawn to a circle from the same external point are ______ in length.",
                zh: "从圆外同一点向圆引出的两条切线，其长度 ______。"
            },
            options: [
                { id: "A", en: "perpendicular", zh: "互相垂直" },
                { id: "B", en: "equal", zh: "相等" },
                { id: "C", en: "unequal", zh: "不相等" }
            ],
            answer: "B",
            explanation: {
                en: "Tangents from a common external point to a circle are always equal in length.",
                zh: "切线长定理：从圆外同一点引出的两条切线段长度相等。"
            }
        }
    ],

    // Level 3: 4题 (2 填空式证明 + 2 选择式填空)
    level3: [
        {
            id: "l3_proof_1",
            type: "proof",
            imageSrc: "./images/l3_proof_1.png",
            imageDesc: {
                en: "[Diagram: Alternate segment theorem proof diagram. Triangle ABC inscribed. Tangent AT at A.]",
                zh: "[图示：弦切角定理证明图。内接三角形ABC。在点A处的切线为AT。]"
            },
            question: {
                en: "The tangent at point A is AT. Complete the proof step: ∠BAT = ∠BCA. State the reason.",
                zh: "切线为AT。完成证明步骤：∠BAT = ∠BCA。请选择对应的理由。"
            },
            options: [
                { id: "opt1", en: "Alternate Segment Theorem", zh: "弦切角定理" },
                { id: "opt2", en: "Angles in Same Segment", zh: "同弧所对圆周角" },
                { id: "opt3", en: "Corresponding Angles", zh: "同位角" }
            ],
            answer: "opt1",
            explanation: {
                en: "The angle between a tangent and a chord through the point of contact is equal to the angle in the alternate segment.",
                zh: "弦切角定理：切线与过切点的弦所夹的角等于它所夹的弧对的圆周角。"
            }
        },
        {
            id: "l3_proof_2",
            type: "proof",
            imageDesc: {
                en: "[Diagram: Proof of 'angle at center is twice angle at circumference'. A line is drawn from circumference through the center to form two isosceles triangles.]",
                zh: "[图示：“圆心角是圆周角的两倍”的证明图。一条线从圆周穿过圆心，形成两个等腰三角形。]"
            },
            question: {
                en: "In the proof for the angle at the centre, radii OA and OB form triangle OAB. Triangle OAB is an ______ triangle because OA = OB.",
                zh: "在证明圆心角定理时，半径 OA 和 OB 构成了三角形 OAB。因为 OA = OB，所以三角形 OAB 是一个 ______ 三角形。"
            },
            options: [
                { id: "opt1", en: "Equilateral", zh: "等边" },
                { id: "opt2", en: "Isosceles", zh: "等腰" },
                { id: "opt3", en: "Right-angled", zh: "直角" }
            ],
            answer: "opt2",
            explanation: {
                en: "Since both OA and OB are radii of the same circle, they are equal in length, making the triangle isosceles.",
                zh: "因为 OA 和 OB 都是同一个圆的半径，它们的长度相等，这使得该三角形成为等腰三角形。"
            }
        },
        {
            id: "l3_fib_1",
            type: "mcq",
            imageSrc: "./images/Intersecting chords.png",
            imageDesc: {
                en: "[Diagram: Intersecting chords theorem. Chords AB and CD intersect at point P inside the circle.]",
                zh: "[图示：相交弦定理。弦 AB 和 CD 在圆内点 P 处相交。]"
            },
            question: {
                en: "If chords AB and CD intersect at point P, then AP × PB = CP × ______.",
                zh: "如果弦 AB 和 CD 在点 P 处相交，根据相交弦定理，AP × PB = CP × ______。"
            },
            options: [
                { id: "A", en: "CD", zh: "CD" },
                { id: "B", en: "AB", zh: "AB" },
                { id: "C", en: "PD", zh: "PD" }
            ],
            answer: "C",
            explanation: {
                en: "The Intersecting Chords Theorem states that when two chords intersect, the products of the lengths of the line segments on each chord are equal.",
                zh: "相交弦定理：圆内两条相交弦，被交点分成的两条线段长的乘积相等。"
            }
        },
        {
            id: "l3_fib_2",
            type: "mcq",
            imageSrc: "./images/Alternate Segment.png",
            imageDesc: {
                en: "[Diagram: A tangent touches a circle at point X. A chord XY makes an angle of 40° with the tangent. Z is a point on the alternate segment.]",
                zh: "[图示：切线与圆在点 X 相切。弦 XY 与切线的夹角为 40°。Z 是另一段圆弧上的点。]"
            },
            question: {
                en: "A tangent makes an angle of 40° with a chord. What is the size of the angle in the alternate segment?",
                zh: "一条切线与弦的夹角为 40°。另一段弧（交替线段）上的圆周角大小是多少度？"
            },
            options: [
                { id: "A", en: "20°", zh: "20°" },
                { id: "B", en: "40°", zh: "40°" },
                { id: "C", en: "80°", zh: "80°" }
            ],
            answer: "B",
            explanation: {
                en: "By the Alternate Segment Theorem, the angle in the alternate segment is exactly equal to the angle between the tangent and the chord (40°).",
                zh: "根据弦切角定理，另一段弧上的圆周角大小正好等于切线与弦的夹角大小 (40°)。"
            }
        }
    ]
};


/**
 * 题库管理器类
 * 用于随机抽取题目并保证在同一轮次中不重复。
 */
class QuestionBankManager {
    constructor(data) {
        this.data = data;
        this.usedQuestions = {
            level1: new Set(),
            level2: new Set(),
            level3: new Set()
        };
    }

    /**
     * 随机获取一道指定难度的题目
     * @param {string} level - 难度级别 ('level1', 'level2', 'level3')
     * @returns {Object|null} 题目对象。如果该难度的题抽完了，返回 null
     */
    getRandomQuestion(level) {
        const questions = this.data[level];
        if (!questions || questions.length === 0) return null;

        const used = this.usedQuestions[level];

        // 如果题目已经全部抽过一遍，可以选择自动重置（这里选择返回null，让外部控制是否重置）
        if (used.size >= questions.length) {
            console.warn(`All questions in ${level} have been used. Call resetLevel('${level}') to start over.`);
            return null;
        }

        // 筛选出还没有抽过的题目
        const availableQuestions = questions.filter(q => !used.has(q.id));

        // 随机抽取一个
        const randomIndex = Math.floor(Math.random() * availableQuestions.length);
        const selectedQuestion = availableQuestions[randomIndex];

        // 将抽到的题目ID记入“已使用”集合
        used.add(selectedQuestion.id);

        // 返回前做一个深拷贝，防止外部代码意外修改题库数据
        return JSON.parse(JSON.stringify(selectedQuestion));
    }

    /**
     * 重置某个难度的抽题记录
     * @param {string} level 
     */
    resetLevel(level) {
        if (this.usedQuestions[level]) {
            this.usedQuestions[level].clear();
        }
    }

    /**
     * 重置所有抽题记录
     */
    resetAll() {
        this.usedQuestions.level1.clear();
        this.usedQuestions.level2.clear();
        this.usedQuestions.level3.clear();
    }
}

// 导出实例对象，供主程序调用
// 如果使用 ES6 模块环境： export const questionManager = new QuestionBankManager(circleQuestionsData);
const questionManager = new QuestionBankManager(circleQuestionsData);