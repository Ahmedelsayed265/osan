document.addEventListener("DOMContentLoaded", () => {
  (() => {
    const parent = document.querySelector(".size-box");
    if (!parent) {
      return;
    }

    // ======= إنشاء دالة للفاصل =======
    const createSeparator = () => {
      const div = document.createElement("div");
      div.className = "custom-line-placeholder";
      const span1 = document.createElement("span");
      const span2 = document.createElement("span");
      div.appendChild(span1);
      div.appendChild(span2);
      return div;
    };

    // =================== العناصر العليا ===================
    const qLensQuestion = [...parent.querySelectorAll("[name]")].find(
      (el) => el.name && el.name.includes("تفصيل عدسات")
    );

    let separatorBeforeLensQuestion = null;

    if (qLensQuestion) {
      separatorBeforeLensQuestion = createSeparator();
      const lensFormGroup = qLensQuestion.closest(".form-group");
      if (lensFormGroup) {
        lensFormGroup.parentElement.insertBefore(
          separatorBeforeLensQuestion,
          lensFormGroup
        );
      }
    }

    const hideSeparator = () => {
      if (separatorBeforeLensQuestion)
        separatorBeforeLensQuestion.style.display = "none";
    };

    // دالة لإظهار الفاصل
    const showSeparator = () => {
      if (separatorBeforeLensQuestion)
        separatorBeforeLensQuestion.style.display = "";
    };

    const allBeforeLens = [...parent.querySelectorAll("*")].filter(
      (el) =>
        qLensQuestion &&
        qLensQuestion.compareDocumentPosition(el) &
          Node.DOCUMENT_POSITION_PRECEDING
    );

    const qLensColorTop = allBeforeLens.find(
      (el) => el.name && el.name.includes("لون العدسات")
    );

    if (qLensColorTop && qLensColorTop.tagName === "SELECT") {
      const firstValidOption = [...qLensColorTop.options].find(
        (opt) => opt.value && !opt.textContent.includes("اختر")
      );
      if (firstValidOption) {
        qLensColorTop.value = firstValidOption.value;
        qLensColorTop.dispatchEvent(new Event("change"));
      }
    }

    const optionsContainerTop = allBeforeLens.find(
      (el) => el.id === "product-custom-user-option-fields"
    );
    const photoCheckbox = optionsContainerTop?.querySelector(
      'input[name*="فوتوكروميك"]'
    );
    const polarizedCheckbox = optionsContainerTop?.querySelector(
      'input[name*="بولارايزد"]'
    );
    const blueLightCheckbox = optionsContainerTop?.querySelector(
      'input[name*="الأشعة الزرقاء"]'
    );

    const optionsLabelTop = optionsContainerTop?.querySelector("label");

    const topContainer = optionsContainerTop?.parentElement; // العنصر الأب لكل شيء في الجزء العلوي

    const toggleVisibility = (el, show) => {
      if (!el) return;
      const group =
        el.closest(".form-group") ||
        el.closest("div[id^='product-custom-user']");
      if (group) group.style.display = show ? "" : "none";
    };

    // ======= دالة لإخفاء ومسح الجزء العلوي =======
    let isResettingTop = false;
    const resetTopSection = () => {
      if (isResettingTop) return;
      isResettingTop = true;
      // إخفاء الحاوية الرئيسية
      if (topContainer) topContainer.style.display = "none";

      // إعادة ضبط الـ select (تغيير لون العدسات)
      if (qLensColorTop) {
        const firstValidOption = [...qLensColorTop.options].find(
          (opt) => opt.value && !opt.textContent.includes("اختر")
        );
        if (firstValidOption) {
          qLensColorTop.value = firstValidOption.value;
        }
        toggleVisibility(qLensColorTop, false);
      }

      // إعادة ضبط checkbox الفوتوكروميك
      if (photoCheckbox) {
        photoCheckbox.checked = false;
        toggleVisibility(photoCheckbox, false);
      }

      // إعادة ضبط checkbox البولارايزد
      if (polarizedCheckbox) {
        polarizedCheckbox.checked = false;
        toggleVisibility(polarizedCheckbox, false);
      }

      // إعادة ضبط checkbox الأشعة الزرقاء
      if (blueLightCheckbox) {
        blueLightCheckbox.checked = false;
        toggleVisibility(blueLightCheckbox, false);
      }

      // إخفاء الـ label إن وجد
      if (optionsLabelTop) optionsLabelTop.style.display = "none";

      // ✅ استدعاء change events لضمان تحديث أي منطق مرتبط
      setTimeout(() => {
        qLensColorTop?.dispatchEvent(new Event("change"));
        photoCheckbox?.dispatchEvent(new Event("change"));
        polarizedCheckbox?.dispatchEvent(new Event("change"));
        blueLightCheckbox?.dispatchEvent(new Event("change"));
        isResettingTop = false; // ✅ فك الحماية بعد التنفيذ
      }, 0);
    };

    const showTopSection = () => {
      if (topContainer) topContainer.style.display = "";
      if (qLensColorTop) toggleVisibility(qLensColorTop, true);
      if (photoCheckbox) toggleVisibility(photoCheckbox, true);
      if (polarizedCheckbox) toggleVisibility(polarizedCheckbox, true);
      if (blueLightCheckbox) toggleVisibility(blueLightCheckbox, true);
      if (optionsLabelTop) optionsLabelTop.style.display = "";
    };

    const updateTopLogic = () => {
      if (!qLensQuestion) {
        // إذا لم يكن هناك سؤال تفصيل عدسات، أظهر الجزء العلوي
        showTopSection();
        showSeparator();
        return;
      }
      
      if (qLensQuestion.value.trim() === "نعم") {
        resetTopSection();
        hideSeparator();
        return;
      } else {
        showTopSection();
        showSeparator();
      }

      // باقي منطق الجزء العلوي كما هو
      const val = qLensColorTop?.value.trim();
      if (!val) {
        toggleVisibility(photoCheckbox, false);
        toggleVisibility(polarizedCheckbox, false);
        toggleVisibility(blueLightCheckbox, false);
        if (optionsLabelTop) optionsLabelTop.style.display = "none";
        return;
      }

      if (val.includes("شفاف")) {
        toggleVisibility(photoCheckbox, true);
        toggleVisibility(polarizedCheckbox, false);
        toggleVisibility(blueLightCheckbox, true);
        if (polarizedCheckbox) polarizedCheckbox.checked = false;
        if (photoCheckbox) photoCheckbox.checked = false;
        if (blueLightCheckbox) blueLightCheckbox.checked = false;
      } else {
        toggleVisibility(photoCheckbox, false);
        toggleVisibility(polarizedCheckbox, true);
        toggleVisibility(blueLightCheckbox, false);
        if (polarizedCheckbox) polarizedCheckbox.checked = false;
        if (photoCheckbox) photoCheckbox.checked = false;
        if (blueLightCheckbox) blueLightCheckbox.checked = false;
      }

      const anyVisible =
        photoCheckbox?.closest(".form-group")?.style.display !== "none" ||
        polarizedCheckbox?.closest(".form-group")?.style.display !== "none" ||
        blueLightCheckbox?.closest(".form-group")?.style.display !== "none";
      if (optionsLabelTop)
        optionsLabelTop.style.display = anyVisible ? "" : "none";
    };

    qLensColorTop?.addEventListener("change", updateTopLogic);
    qLensQuestion?.addEventListener("change", updateTopLogic);
    updateTopLogic();

    // =================== العدسات ===================
    // إذا لم يكن هناك qLensQuestion، استخدم parent كله
    const allAfterLens = qLensQuestion
      ? [...parent.querySelectorAll("*")].filter(
          (el) =>
            qLensQuestion.compareDocumentPosition(el) &
            Node.DOCUMENT_POSITION_FOLLOWING
        )
      : [...parent.querySelectorAll("*")];

    const qLensColor = allAfterLens.find(
      (el) => el.name && el.name.includes("لون العدسات")
    );
    const qPackage = allAfterLens.find(
      (el) => el.name && el.name.includes("باقة")
    );
    const qPrescription = allAfterLens.find(
      (el) =>
        el.name && (el.name.includes("الوصفة") || el.name.includes("مقـاس"))
    );

    // ======= دمج واجهة رفع الوصفة الطبية =======
    if (qPrescription) {
      const prescriptionInput =
        qPrescription.tagName === "INPUT"
          ? qPrescription
          : qPrescription.querySelector(
              'input[type="file"], input[type="text"]'
            );
      if (prescriptionInput) {
        const formGroup = prescriptionInput.closest(".form-group");
        if (formGroup) {
          // إخفاء العناصر الأصلية
          formGroup
            .querySelectorAll(
              ".file-label, .form-control > span, .form-control > button, .form-control > label"
            )
            .forEach((el) => (el.style.display = "none"));

          // إنشاء واجهة جديدة
          const wrapperDiv = document.createElement("div");
          wrapperDiv.className = "custom-upload-box";
          wrapperDiv.setAttribute("draggable", "true");

          const icon = document.createElement("div");
          icon.className = "upload-icon";
          icon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" color="#000000" fill="none">
          <path d="M7.00018 6.00055C5.77954 6.00421 5.10401 6.03341 4.54891 6.2664C3.77138 6.59275 3.13819 7.19558 2.76829 7.96165C2.46636 8.58693 2.41696 9.38805 2.31814 10.9903L2.1633 13.501C1.91757 17.4854 1.7947 19.4776 2.96387 20.7388C4.13303 22 6.10271 22 10.0421 22H13.9583C17.8977 22 19.8673 22 21.0365 20.7388C22.2057 19.4776 22.0828 17.4854 21.8371 13.501L21.6822 10.9903C21.5834 9.38805 21.534 8.58693 21.2321 7.96165C20.8622 7.19558 20.229 6.59275 19.4515 6.2664C18.8964 6.03341 18.2208 6.00421 17.0002 6.00055" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path>
          <path d="M17 7L16.1142 4.78543C15.732 3.82996 15.3994 2.7461 14.4166 2.25955C13.8924 2 13.2616 2 12 2C10.7384 2 10.1076 2 9.58335 2.25955C8.6006 2.7461 8.26801 3.82996 7.88583 4.78543L7 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
          <path d="M15.5 14C15.5 15.933 13.933 17.5 12 17.5C10.067 17.5 8.5 15.933 8.5 14C8.5 12.067 10.067 10.5 12 10.5C13.933 10.5 15.5 12.067 15.5 14Z" stroke="currentColor" stroke-width="1.5"></path>
          <path d="M11.9998 6H12.0088" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
      </svg>`;

          const hintText = document.createElement("div");
          hintText.className = "upload-hint";
          hintText.textContent = window.i18n.dragHint;

          const button = document.createElement("button");
          button.type = "button";
          button.className = "tp-btn";
          button.textContent = window.i18n.browse;
          button.addEventListener("click", () => prescriptionInput.click());

          const preview = document.createElement("img");
          preview.className = "upload-preview";
          preview.style.display = "none";

          const fileName = document.createElement("div");
          fileName.className = "file-name";
          fileName.style.display = "none";

          const deleteBtn = document.createElement("span");
          deleteBtn.className = "delete-icon";
          deleteBtn.textContent = "✖";
          deleteBtn.style.display = "none";
          deleteBtn.addEventListener("click", () => {
            prescriptionInput.value = "";
            preview.src = "";
            preview.style.display = "none";
            fileName.textContent = "";
            fileName.style.display = "none";
            deleteBtn.style.display = "none";
          });

          function handleFile(file) {
            if (!file) return;
            fileName.textContent = file.name;
            fileName.style.display = "block";
            deleteBtn.style.display = "inline-block";
            if (file.type.startsWith("image/")) {
              const reader = new FileReader();
              reader.onload = (e) => {
                preview.src = e.target.result;
                preview.style.display = "block";
              };
              reader.readAsDataURL(file);
            } else {
              preview.src = "";
              preview.style.display = "none";
            }
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            prescriptionInput.files = dataTransfer.files;
          }

          prescriptionInput.addEventListener("change", () =>
            handleFile(prescriptionInput.files[0])
          );

          wrapperDiv.addEventListener("dragover", (e) => {
            e.preventDefault();
            wrapperDiv.classList.add("drag-over");
          });
          wrapperDiv.addEventListener("dragleave", () =>
            wrapperDiv.classList.remove("drag-over")
          );
          wrapperDiv.addEventListener("drop", (e) => {
            e.preventDefault();
            wrapperDiv.classList.remove("drag-over");
            handleFile(e.dataTransfer.files[0]);
          });

          wrapperDiv.appendChild(icon);
          wrapperDiv.appendChild(hintText);
          wrapperDiv.appendChild(button);
          wrapperDiv.appendChild(preview);
          wrapperDiv.appendChild(fileName);
          wrapperDiv.appendChild(deleteBtn);

          prescriptionInput.parentNode.appendChild(wrapperDiv);
        }
      }
    }

    const optionsContainer = allAfterLens.find(
      (el) => el.id === "product-custom-user-option-fields"
    );
    const optionCheckboxes = optionsContainer
      ? [...optionsContainer.querySelectorAll('input[type="checkbox"]')]
      : [];
    const optionsLabel = optionsContainer?.querySelector("label");

    const optionMap = {
      blueLight: "الأشعة الزرقاء",
      photo: "فوتوكروم",
      bifocal: "بايفوكل",
      progressive: "بروقريسف",
      polarized: "بولارايزد",
    };

    // ======= دالة لتفريغ الإضافات المحددة مسبقًا =======
    const clearCheckedAdditions = () => {
      const additions = Object.values(optionMap); // استخدام القيم من optionMap
      optionCheckboxes.forEach((chk) => {
        if (additions.some((name) => chk.name.includes(name))) {
          chk.checked = false;
        }
      });
    };

    // ======= ربط الدالة على أي تغيير في Select أو Checkbox =======
    [qLensColor, qPackage].forEach((sel) =>
      sel?.addEventListener("change", clearCheckedAdditions)
    );

    const toggleGroup = (el, show) => {
      if (!el) return;
      const group =
        el.closest(".form-group")?.parentElement || el.closest(".form-group");
      if (group) group.style.display = show ? "" : "none";
    };

    const hideAll = () => {
      [qLensColor, qPackage, qPrescription].forEach((el) =>
        toggleGroup(el, false)
      );
      if (optionsContainer) optionsContainer.style.display = "none";
      if (optionsLabel) optionsLabel.style.display = "none";
      optionCheckboxes.forEach((c) => (c.checked = false));
    };

    // const resetLensFields = () => {
    //   [qLensColor, qPackage, qPrescription].forEach((el) => {
    //     if (!el) return;
    //     if (el.tagName === "SELECT") el.selectedIndex = 0;
    //     if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") el.value = "";
    //     toggleGroup(el, false);
    //   });
    //   optionCheckboxes.forEach((c) => (c.checked = false));
    //   if (optionsContainer) optionsContainer.style.display = "none";
    //   if (optionsLabel) optionsLabel.style.display = "none";
    // };
    const resetLensFields = () => {
      // 1️⃣ إعادة ضبط القيم الأساسية
      [qLensColor, qPackage, qPrescription].forEach((el) => {
        if (!el) return;
        if (el.tagName === "SELECT") el.selectedIndex = 0;
        if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") el.value = "";
        toggleGroup(el, false);
      });

      // 2️⃣ إلغاء تحديد كل الـ checkboxes وإطلاق الحدث الحقيقي
      optionCheckboxes.forEach((c) => {
        if (c.checked) {
          c.checked = false;
          c.dispatchEvent(new InputEvent("input", { bubbles: true }));
        }
      });

      // 3️⃣ إخفاء عناصر واجهة العدسات
      if (optionsContainer) optionsContainer.style.display = "none";
      if (optionsLabel) optionsLabel.style.display = "none";

      // 4️⃣ إعادة حساب السعر الأساسي بعد التصفير
      if (typeof refreshTotal === "function") {
        refreshTotal();
      } else if (typeof calcLensDetailPrice === "function") {
        calcLensDetailPrice();
      }
    };


    // const showOptions = (...keys) => {
    //   if (!optionsContainer) return;
    //   optionCheckboxes.forEach(
    //     (c) => (c.closest(".form-group").style.display = "none")
    //   );
    //   let anyShown = false;
    //   keys.forEach((k) => {
    //     const keyword = optionMap[k];
    //     const chk = optionCheckboxes.find((c) => c.name.includes(keyword));
    //     if (chk) {
    //       chk.closest(".form-group").style.display = "";
    //       anyShown = true;
    //     }
    //   });
    //   optionsContainer.style.display = anyShown ? "" : "none";
    //   if (optionsLabel) optionsLabel.style.display = anyShown ? "" : "none";
    // };
    let currentPack = ""; // نحفظ نوع الباقة الحالية

    const showOptions = (...keys) => {
      if (!optionsContainer) return;

      // إخفاء كل الخيارات أولاً
      optionCheckboxes.forEach(
        (c) => (c.closest(".form-group").style.display = "none")
      );

      let anyShown = false;

      keys.forEach((k) => {
        const keyword = optionMap[k];
        const matchingCheckboxes = optionCheckboxes.filter((c) =>
          c.name.includes(keyword)
        );

        if (!matchingCheckboxes.length) return;

        // ==== معالجة خاصة للبرو والترا ====
        if (keyword === "بايفوكل" || keyword === "بروقريسف") {
          let indexToShow = currentPack === "بريميوم" ? 0 : 1; // النسخة الأولى للبرو، الثانية للترا
          const bifocal = matchingCheckboxes.filter(c => c.name.includes("بايفوكل"))[indexToShow];
          const progressive = matchingCheckboxes.filter(c => c.name.includes("بروقريسف"))[indexToShow];

          if (bifocal) { bifocal.closest(".form-group").style.display = ""; anyShown = true; }
          if (progressive) { progressive.closest(".form-group").style.display = ""; anyShown = true; }
        } else {
          // باقي الخيارات (الأشعة الزرقاء / فوتوكروم إلخ)
          const chk = matchingCheckboxes[0];
          if (chk) {
            chk.closest(".form-group").style.display = "";
            anyShown = true;
          }
        }
      });

      optionsContainer.style.display = anyShown ? "" : "none";
      if (optionsLabel) optionsLabel.style.display = anyShown ? "" : "none";
    };

    // const handleConflict = (e) => {
    //   if (!e.target.checked) return;
    //   const name = e.target.name;
    //   if (name.includes(optionMap.bifocal)) {
    //     // ✅ إلغاء تحديد **كل** البروقريسف (مش بس أول واحد)
    //     optionCheckboxes
    //       .filter((c) => c.name.includes(optionMap.progressive))
    //       .forEach((prog) => (prog.checked = false));
    //   } else if (name.includes(optionMap.progressive)) {
    //     // ✅ إلغاء تحديد **كل** البايفوكل (مش بس أول واحد)
    //     optionCheckboxes
    //       .filter((c) => c.name.includes(optionMap.bifocal))
    //       .forEach((bif) => (bif.checked = false));
    //   }
    // };
    const handleConflict = (e) => {
      if (!e.target.checked) return;
      const name = e.target.name;
      if (name.includes(optionMap.bifocal)) {
        optionCheckboxes
          .filter((c) => c.name.includes(optionMap.progressive))
          .forEach((prog) => {
            prog.checked = false;
            prog.dispatchEvent(new InputEvent("input", { bubbles: true }));
          });
      } else if (name.includes(optionMap.progressive)) {
        optionCheckboxes
          .filter((c) => c.name.includes(optionMap.bifocal))
          .forEach((bif) => {
            bif.checked = false;
            bif.dispatchEvent(new InputEvent("input", { bubbles: true }));
          });
      }
    };


    optionCheckboxes.forEach((c) =>
      c.addEventListener("change", handleConflict)
    );

    // const filterPackageOptions = () => {
    //   if (!qPackage || qPackage.tagName !== "SELECT") return;

    //   const color = qLensColor?.value.trim();
    //   const allOptions = [...qPackage.options];
    //   const actualOptions = allOptions.slice(1); // تخطي "اختر"

    //   const currentValue = qPackage.value;

    //   // حساب عدد الخيارات اللي المفروض تظهر حسب اللون
    //   let optionsToShow = [];

    //   if (color && color.includes("شفاف")) {
    //     optionsToShow = actualOptions.slice(0, 4); // أول 4
    //   } else if (color && color.trim() !== "") {
    //     optionsToShow = actualOptions.slice(-4); // آخر 4
    //   }

    //   // لو الخيارات أقل من 4، نعرض كل الموجود
    //   if (optionsToShow.length < 4) {
    //     optionsToShow = actualOptions;
    //   }

    //   // أولاً نخفي كل الخيارات
    //   actualOptions.forEach((opt) => (opt.style.display = "none"));

    //   // بعد كده نعرض اللي داخل optionsToShow
    //   optionsToShow.forEach((opt) => (opt.style.display = ""));

    //   // إعادة ضبط الاختيار
    //   const selectedOption = [...qPackage.options].find(
    //     (opt) => opt.value === currentValue && opt.style.display !== "none"
    //   );

    //   if (selectedOption) {
    //     qPackage.value = currentValue;
    //   } else {
    //     qPackage.selectedIndex = 0;
    //   }

    // };

    // ✅ حفظ الخيارات الأصلية مرة واحدة
    let originalPackageOptions = null;

    const filterPackageOptions = () => {
      if (!qPackage || qPackage.tagName !== "SELECT") return;

      // حفظ الخيارات الأصلية أول مرة فقط
      if (!originalPackageOptions) {
        originalPackageOptions = [...qPackage.options].map(opt => opt.cloneNode(true));
      }

      const color = qLensColor?.value.trim();
      const currentValue = qPackage.value;

      // حساب أي الخيارات نعرضها (بدون خيار "اختر")
      let optionsToShow = [];

      if (color && color.includes("شفاف")) {
        optionsToShow = originalPackageOptions.slice(1, 5); // أول 4 (بعد "اختر")
      } else if (color && color.trim() !== "") {
        optionsToShow = originalPackageOptions.slice(-4); // آخر 4
      } else {
        // لو مفيش لون، نعرض كل الخيارات
        optionsToShow = originalPackageOptions.slice(1);
      }

      // ✅ إزالة كل الخيارات الحالية (ما عدا "اختر")
      while (qPackage.options.length > 1) {
        qPackage.remove(1);
      }

      // ✅ إضافة الخيارات المطلوبة فقط
      optionsToShow.forEach(opt => {
        qPackage.add(opt.cloneNode(true));
      });

      // إعادة ضبط الاختيار
      const selectedOption = [...qPackage.options].find(
        (opt) => opt.value === currentValue
      );

      if (selectedOption) {
        qPackage.value = currentValue;
      } else {
        qPackage.selectedIndex = 0;
      }
    };


    const updateLensFlow = () => {
      if (!qLensQuestion) return; // إذا لم يكن هناك سؤال تفصيل عدسات، لا تفعل شيء
      const wantMedical = qLensQuestion.value.trim() === "نعم";
      const color = qLensColor?.value.trim();
      const pack = qPackage?.value.trim();

      if (!wantMedical) {
        resetLensFields();
        return;
      }

      [qPrescription, qLensColor].forEach((el) => toggleGroup(el, true));
      if (!color) return;
      
      // تصفية خيارات الباقة حسب اللون
      filterPackageOptions();
      
      toggleGroup(qPackage, true);
      if (!pack) return;

      const isMedical = color.includes("شفاف");
      const isSun = !isMedical && color.trim() !== "";

      if (isMedical) {
        switch (pack) {
          case "ستاندرد":
            currentPack = "ستاندرد";
            showOptions("blueLight", "photo");
            break;

          case "بلس":
            currentPack = "بلس";
            showOptions("blueLight", "photo");
            break;

          case "بريميوم":
            currentPack = "بريميوم";
            showOptions("blueLight", "photo", "bifocal", "progressive");
            break;

          case "الترا":
            currentPack = "الترا";
            showOptions("blueLight", "photo", "bifocal", "progressive");
            break;

          default:
            hideAll();
        }
      }

      if (isSun) {
        if (pack === "بريميوم" || pack === "الترا") {
          showOptions("polarized");
        } else {
          optionCheckboxes.forEach(
            (c) => (c.closest(".form-group").style.display = "none")
          );
          optionsContainer.style.display = "none";
          if (optionsLabel) optionsLabel.style.display = "none";
        }
      }
    };

    [qLensQuestion, qLensColor, qPackage].forEach((sel) =>
      sel?.addEventListener("change", updateLensFlow)
    );

    qLensColor?.addEventListener("change", () => {
      if (qPackage) {
        qPackage.selectedIndex = 0; // يرجع أول خيار (الافتراضي)
        qPackage.dispatchEvent(new Event("change")); // لتحديث المنطق
      }

      // ✅ إخفاء كل الشيك بوكسات الخاصة بالباقات
      if (optionsContainer) {
        optionCheckboxes.forEach((chk) => {
          chk.checked = false; // إلغاء التحديد
          const group = chk.closest(".form-group");
          if (group) group.style.display = "none"; // إخفاء العنصر
        });

        // ✅ إخفاء العنوان (label) كمان لو موجود
        if (optionsLabel) optionsLabel.style.display = "none";
        optionsContainer.style.display = "none";
      }
    });

    // ======= دالة لضبط الحقول الإلزامية =======
    const updateRequiredFields = () => {
      [qLensColor, qPackage, qPrescription].forEach((el) => {
        if (!el) return;
        const group =
          el.closest(".form-group")?.parentElement || el.closest(".form-group");
        if (!group) return;
        el.required = group.style.display !== "none"; // لو ظاهر يبقى الزامى، لو مخفي يبقى مش الزامى
      });
    };

    // استدعاء الدالة بعد كل تحديث للـ Flow
    [qLensQuestion, qLensColor, qPackage].forEach((sel) =>
      sel?.addEventListener("change", () => {
        updateLensFlow();
        updateRequiredFields();
      })
    );

    // استدعاء أولي
    updateRequiredFields();

    // =================== الهدايا ===================
    // البحث في .size-box كله وليس فقط allAfterLens (لأن التغليف قد يكون بدون تفصيل عدسات)
    const giftSelect = parent.querySelector('[name*="تغليفها كهدية"]');
    const msgCheckbox = parent.querySelector('[name*="رسالة في الكرت"]');
    const songCheckbox = parent.querySelector('[name*="اغنية في الكرت"]');
    const msgInput = parent.querySelector('[name*="اكتب الرسالة"]');
    const songInput = parent.querySelector('[name*="ارفق رابط"]');
    const giftContainer = parent.querySelector('[name*="محتوى الكرت"], [name*="محتوي الكرت"]');

    (() => {
      const allGiftTitles = [
        ...document.querySelectorAll(
          "#product-custom-user-option-fields label"
        ),
      ].filter((el) => {
        const text = el.textContent.trim();
        return text === "محتوى الكرت" || text === "محتوي الكرت";
      });
      allGiftTitles.slice(1).forEach((el) => (el.style.display = "none"));
    })();

    // ======= إضافة الفاصل قبل الهدايا =======
    if (giftSelect) {
      const giftFormGroup = giftSelect.closest(".form-group");
      const separatorGift = createSeparator();
      if (giftFormGroup) {
        giftFormGroup.parentElement.insertBefore(separatorGift, giftFormGroup);
      }
    }

    const updateGiftFlow = () => {
      if (!giftSelect) return;
      const val = giftSelect.value.trim();
      if (val === "نعم") {
        toggleVisibility(giftContainer, true);
        toggleVisibility(msgCheckbox, true);
        toggleVisibility(songCheckbox, true);
      } else {
        toggleVisibility(giftContainer, false);
        [msgCheckbox, songCheckbox, msgInput, songInput].forEach((el) =>
          toggleVisibility(el, false)
        );
        if (msgCheckbox) msgCheckbox.checked = false;
        if (songCheckbox) songCheckbox.checked = false;
      }
    };

    const handleMsg = () => toggleVisibility(msgInput, msgCheckbox?.checked);
    const handleSong = () => toggleVisibility(songInput, songCheckbox?.checked);

    if (giftSelect) {
      giftSelect.addEventListener("change", updateGiftFlow);
    }
    msgCheckbox?.addEventListener("change", handleMsg);
    songCheckbox?.addEventListener("change", handleSong);

    const updateGiftRequired = () => {
      if (msgInput)
        msgInput.required =
          msgInput.closest(".form-group").style.display !== "none";
      if (songInput)
        songInput.required =
          songInput.closest(".form-group").style.display !== "none";
    };

    // أول ما الصفحة تفتح، اخفي الحقول
    msgInput?.closest(".form-group")?.style.setProperty("display", "none");
    songInput?.closest(".form-group")?.style.setProperty("display", "none");

    // ✅ نفّذ التدفق قبل التحقق من الإلزام (فقط إذا كان giftSelect موجود)
    if (giftSelect) {
      updateGiftFlow();
      setTimeout(updateGiftRequired, 50); // تأخير بسيط لضمان تنفيذ الـ Flow أولًا

      // ✅ كل تغيير على عناصر الهدايا
      [giftSelect, msgCheckbox, songCheckbox].forEach((el) => {
        if (el) {
          el.addEventListener("change", () => {
            updateGiftFlow();
            setTimeout(updateGiftRequired, 50); // نفس المنطق هنا
          });
        }
      });
    }

    updateLensFlow();
    updateRequiredFields();

  })();

  const targetSpan = Array.from(document.querySelectorAll("span")).find((el) =>
    el.textContent.includes("تفصيل عدسات")
  );
  const lensTitle = document.querySelector(".lens-title");
  if (targetSpan && lensTitle) {
    targetSpan.parentNode.insertBefore(lensTitle, targetSpan.nextSibling);
    lensTitle.classList.add("active");
  } else {
  }
});

document.addEventListener("DOMContentLoaded", function () {
  const parent = document.querySelector(".size-box");
  if (!parent) return;

  // ===============================
  // 🟢 عناصر العرض (في واجهة HTML)
  // ===============================
  const lensColorPriceEl = document.querySelector(".lens-color-price");
  const lensDetailPriceEl = document.querySelector(".lens-detail-price");
  const totalPriceEl = document.querySelector(".total-price--final");
  const productPriceEl = document.querySelector(
    ".price-item.product-price-default"
  );
  const packagePriceEl = document.querySelector(".price-item.package-price");

  // ===============================
  // 🟢 دوال استخراج الأسعار
  // ===============================
  // --- استخراج السعر من option ---
function extractSelectPrice(optionEl) {
  if (!optionEl) return 0;
  const text = optionEl.textContent || "";

  // إزالة الفواصل آلاف (,)
  const cleanText = text.replace(/,/g, '');
  const match = cleanText.match(/(\d+\.\d{2})/);
  return match ? parseFloat(match[1]) : 0;
}


  // --- استخراج السعر من checkbox ---
function extractCheckboxPrice(chk) {
  if (!chk || !chk.checked) return 0;
  const label = chk.closest("label");
  if (!label) return 0;
  const text = label.innerText || "";

  // إزالة الفواصل آلاف (,) ثم البحث عن الرقم العشري
  const cleanText = text.replace(/,/g, '');
  const match = cleanText.match(/(\d+\.\d{2})/);
  return match ? parseFloat(match[1]) : 0;
}


  // ===============================
  // 🟢 الجزء العلوي (لون العدسات + إضافات)
  // ===============================
  const qLensQuestion = [...parent.querySelectorAll("[name]")].find(
    (el) => el.name && el.name.includes("تفصيل عدسات")
  );
  if (!qLensQuestion) return;

  const allBeforeLens = [...parent.querySelectorAll("*")].filter(
    (el) =>
      qLensQuestion.compareDocumentPosition(el) &
      Node.DOCUMENT_POSITION_PRECEDING
  );

  const qLensColorTop = allBeforeLens.find(
    (el) => el.name && el.name.includes("لون العدسات")
  );

  const optionsContainerTop = allBeforeLens.find(
    (el) => el.id === "product-custom-user-option-fields"
  );

  const checkboxesTop = optionsContainerTop
    ? [...optionsContainerTop.querySelectorAll('input[type="checkbox"]')]
    : [];

  function calcLensTopPrice() {
    let total = 0;

    // لون العدسات العلوي
    if (qLensColorTop && qLensColorTop.tagName === "SELECT") {
      const selected = qLensColorTop.options[qLensColorTop.selectedIndex];
      total += extractSelectPrice(selected);
    }

    // خيارات إضافية (checkboxes)
    checkboxesTop.forEach((chk) => (total += extractCheckboxPrice(chk)));

    if (lensColorPriceEl) lensColorPriceEl.textContent = formatPrice(total);
    refreshTotal();
    togglePriceVisibility();
  }

  // ===============================
  // 🟢 الجزء السفلي (تفصيل العدسات + الإضافات)
  // ===============================
  const allAfterLens = [...parent.querySelectorAll("*")].filter(
    (el) =>
      qLensQuestion.compareDocumentPosition(el) &
      Node.DOCUMENT_POSITION_FOLLOWING
  );

  const qLensColor = allAfterLens.find(
    (el) => el.name && el.name.includes("لون العدسات")
  );
  const qPackage = allAfterLens.find(
    (el) => el.name && el.name.includes("باقة")
  );

  // ✅ جمع **كل** الـ checkboxes (مش بس أول واحد)
  const optionsContainer = allAfterLens.find(
    (el) => el.id === "product-custom-user-option-fields"
  );
  const allLensCheckboxes = optionsContainer
    ? [...optionsContainer.querySelectorAll('input[type="checkbox"]')]
    : [];

  function calcLensDetailPrice() {
    let total = 0;

    // لون العدسات السفلي
    if (qLensColor && qLensColor.tagName === "SELECT") {
      const selected = qLensColor.options[qLensColor.selectedIndex];
      total += extractSelectPrice(selected);
    }

    // الباقة
    if (qPackage && qPackage.tagName === "SELECT") {
      const selected = qPackage.options[qPackage.selectedIndex];
      total += extractSelectPrice(selected);
    }

    // ✅ الخيارات الإضافية: نجمع **كل** الـ checkboxes المحددة
    allLensCheckboxes.forEach((chk) => {
      total += extractCheckboxPrice(chk);
    });

    if (lensDetailPriceEl) lensDetailPriceEl.textContent = formatPrice(total);
    refreshTotal();
    togglePriceVisibility();
  }

  // ===============================
  // 🟢 الجزء الثالث (خيارات التغليف والهدايا)
  // ===============================
  const giftSelect = document.querySelector('[name*="تغليفها كهدية"]');
  function updatePackagePrice() {
    if (!giftSelect || giftSelect.tagName !== "SELECT") return;

    const selected = giftSelect.options[giftSelect.selectedIndex];
    const price = extractSelectPrice(selected) || 0;

    if (packagePriceEl) {
      packagePriceEl.textContent = formatPrice(price);
    }

    refreshTotal(); // يحدث الإجمالي بعد تعديل السعر
    togglePriceVisibility();
  }
  giftSelect?.addEventListener("change", updatePackagePrice);

  // ===============================
  // 🟢 حساب الإجمالي النهائي
  // ===============================
  function formatPrice(value) {
    // لو فيه كسور حقيقية (زي 199.50) نظهرها، غير كده نخليها رقم صحيح
    return value % 1 === 0 ? value.toString() : value.toFixed(2);
  }

  function refreshTotal() {
    const total =
      (parseFloat(productPriceEl?.textContent) || 0) +
      (parseFloat(lensColorPriceEl?.textContent) || 0) +
      (parseFloat(lensDetailPriceEl?.textContent) || 0) +
      (parseFloat(packagePriceEl?.textContent) || 0);

    if (totalPriceEl) totalPriceEl.textContent = formatPrice(total);
    
    // ✅ إخفاء/إظهار الأسعار بناءً على القيمة
    togglePriceVisibility();
  }
  
  // ✅ دالة لإخفاء/إظهار الأسعار
  function togglePriceVisibility() {
    // سعر المنتج الأصلي يبقى ظاهر دائماً - لا نلمسه
    
    // سعر لون العدسات العلوي
    const lensColorPrice = parseFloat(lensColorPriceEl?.textContent) || 0;
    const lensColorPriceParent = lensColorPriceEl?.closest('p');
    if (lensColorPriceParent) {
      lensColorPriceParent.style.display = lensColorPrice > 0 ? '' : 'none';
    }
    
    // سعر تفصيل العدسات
    const lensDetailPrice = parseFloat(lensDetailPriceEl?.textContent) || 0;
    const lensDetailPriceParent = lensDetailPriceEl?.closest('p');
    if (lensDetailPriceParent) {
      lensDetailPriceParent.style.display = lensDetailPrice > 0 ? '' : 'none';
    }
    
    // سعر الباقة/التغليف
    const packagePrice = parseFloat(packagePriceEl?.textContent) || 0;
    const packagePriceParent = packagePriceEl?.closest('p');
    if (packagePriceParent) {
      packagePriceParent.style.display = packagePrice > 0 ? '' : 'none';
    }
    
    // السعر الإجمالي
    const totalPrice = parseFloat(totalPriceEl?.textContent) || 0;
    const totalPriceParent = totalPriceEl?.closest('p');
    if (totalPriceParent) {
      totalPriceParent.style.display = totalPrice > 0 ? '' : 'none';
    }
  }

  // ===============================
  // 🟢 الأحداث والتحديث التلقائي
  // ===============================
  qLensColorTop?.addEventListener("change", calcLensTopPrice);
  checkboxesTop.forEach((chk) =>
    chk.addEventListener("change", calcLensTopPrice)
  );

  if (qLensColor) qLensColor.addEventListener("change", calcLensDetailPrice);
  if (qPackage) qPackage.addEventListener("change", calcLensDetailPrice);
  
  // ✅ ربط كل الـ checkboxes بحساب السعر
  allLensCheckboxes.forEach((chk) =>
    chk.addEventListener("change", calcLensDetailPrice)
  );

  // --- تشغيل أولي ---
  calcLensTopPrice();
  calcLensDetailPrice();
  togglePriceVisibility(); // ✅ تطبيق الإخفاء/الإظهار عند التحميل
});
