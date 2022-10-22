document.querySelector('#addRecipeWithLink').addEventListener('click', addRecipeWithLink)

function addRecipeWithLink() {
    console.log('success')
    let originalRecipe = document.querySelector('#originalRecipe')
    let linkedRecipe = document.querySelector('#recipeLink')

    originalRecipe.style.display = "none"
    linkedRecipe.style.display = "block"
}